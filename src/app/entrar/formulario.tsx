"use client";

import { useActionState } from "react";

import { type EstadoEntrar, pedirEnlace } from "@/servidor/sesion";

const INICIAL: EstadoEntrar = { paso: "formulario", correo: "" };

export function FormularioEntrar() {
  const [estado, enviar, enviando] = useActionState(pedirEnlace, INICIAL);

  if (estado.paso === "enviado") {
    return (
      <p role="status">
        Si {estado.correo} tiene acceso, ya salió un correo con el enlace para
        entrar. El enlace vence en una hora.
      </p>
    );
  }

  return (
    <form action={enviar}>
      <label htmlFor="correo">Correo</label>
      <input
        id="correo"
        name="correo"
        type="email"
        autoComplete="email"
        required
        defaultValue={estado.correo}
        aria-invalid={estado.error ? true : undefined}
        aria-describedby={estado.error ? "correo-error" : undefined}
      />
      {estado.error ? (
        <p id="correo-error" role="alert">
          {estado.error}
        </p>
      ) : null}
      <button type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar enlace"}
      </button>
    </form>
  );
}
