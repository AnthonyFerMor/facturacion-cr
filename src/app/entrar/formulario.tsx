"use client";

import { type ReactNode, useActionState, useState } from "react";

import { Boton } from "@/componentes/boton";
import { Campo } from "@/componentes/campo";
import { type EstadoEntrar, pedirEnlace } from "@/servidor/sesion";

import estilos from "./entrar.module.css";

const INICIAL: EstadoEntrar = { paso: "formulario", correo: "" };

/** `children` es el aviso que la página muestra entre el título y el formulario. */
export function FormularioEntrar({ children }: { children: ReactNode }) {
  // Cambiar la llave vuelve a montar el formulario, vacío, para pedir el enlace con otro correo.
  const [intento, setIntento] = useState(0);
  return (
    <Formulario key={intento} otroCorreo={() => setIntento(intento + 1)}>
      {children}
    </Formulario>
  );
}

function Formulario({
  otroCorreo,
  children,
}: {
  otroCorreo: () => void;
  children: ReactNode;
}) {
  const [estado, enviar, enviando] = useActionState(pedirEnlace, INICIAL);

  if (estado.paso === "enviado") {
    return (
      <div className={estilos.enviado}>
        <div className={estilos.cabeza} role="status">
          <h1 className={estilos.titulo}>Revise su correo</h1>
          <p className={estilos.texto}>
            Si {estado.correo} tiene acceso, ya salió un correo con el enlace
            para entrar. El enlace vence en una hora.
          </p>
        </div>
        <Boton onClick={otroCorreo}>Usar otro correo</Boton>
      </div>
    );
  }

  return (
    <>
      <div className={estilos.cabeza}>
        <h1 className={estilos.titulo}>Entrar</h1>
        <p className={estilos.texto}>
          Escriba su correo y le llega un enlace para entrar, sin contraseña
        </p>
      </div>
      {children}
      <form action={enviar} className={estilos.formulario}>
        <Campo
          id="correo"
          etiqueta="Correo"
          name="correo"
          type="email"
          autoComplete="email"
          required
          defaultValue={estado.correo}
          error={estado.error}
        />
        <Boton type="submit" variante="principal" ancho disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar enlace"}
        </Boton>
      </form>
    </>
  );
}
