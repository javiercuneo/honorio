// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// lib/wizard/reachability.ts
// Alcanzabilidad de los pasos del wizard: que se pregunta, y por lo
// tanto que respuestas tienen derecho a existir.
//
// Framework-agnostico: sin React, sin DOM. Lo consumen el hook y las
// validaciones del motor.
//
// Por que existe este archivo
// ---------------------------
// `answers` era un acumulador que solo crecia. Al volver atras y
// cambiar una respuesta, las que dependian de ella quedaban huerfanas:
// ya no se preguntaban, pero seguian en el objeto y el motor las leia
// igual. De ahi salian estados que la entrevista nunca puede producir
// yendo hacia adelante, por ejemplo "sucesion + honorarios provisorios"
// (el proceso sucesorio no pregunta forma de terminacion).
//
// La regla es una sola: **una respuesta vive mientras su paso sea
// visible.** Todo lo demas se deriva de ahi.
// ---------------------------------------------------------------

import type { Answers } from '@/lib/legal/types'
import { PROCESS_STEP_MAP, type WizardStepDef } from './wizard-schema'

/**
 * Pasos que la entrevista muestra para un conjunto de respuestas dado.
 * Es la definicion unica de "visible": el hook la usa para navegar y la
 * poda la usa para decidir que respuesta sobrevive.
 */
export function pasosVisibles(allSteps: WizardStepDef[], answers: Answers): WizardStepDef[] {
  const tipo = answers.tipoProceso as string | undefined
  const stepIds = tipo ? PROCESS_STEP_MAP[tipo] : undefined
  const candidatos = stepIds
    ? allSteps.filter((s) => stepIds.includes(s.id))
    : allSteps
  return candidatos.filter((step) => {
    if (!step.condition) return true
    return step.condition(answers)
  })
}

/**
 * Descarta toda respuesta cuyo paso ya no se pregunta.
 *
 * Itera hasta punto fijo porque podar una respuesta puede volver
 * invisible a otro paso: al cambiar `modoTerminacion` de 'caducidad' a
 * 'sentencia' cae `caducidadCriterio`, y al caer este cae tambien
 * `aperturaPrueba`, que dependia de ambos.
 *
 * Devuelve el mismo objeto si no hay nada que podar, para no forzar
 * renders inutiles.
 */
export function podarInalcanzables(allSteps: WizardStepDef[], answers: Answers): Answers {
  let actual = answers
  // Cota de seguridad: la cadena de dependencias del schema tiene 3
  // niveles; 10 vueltas es holgura, no un limite esperado.
  for (let i = 0; i < 10; i++) {
    const vivos = new Set(pasosVisibles(allSteps, actual).map((s) => s.id))
    const claves = Object.keys(actual)
    const sobrevivientes = claves.filter((id) => vivos.has(id))
    if (sobrevivientes.length === claves.length) return actual
    const siguiente: Answers = {}
    for (const id of sobrevivientes) siguiente[id] = actual[id]
    actual = siguiente
  }
  return actual
}
