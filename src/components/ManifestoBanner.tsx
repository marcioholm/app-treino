'use client';

import { useState, useEffect } from 'react';

const FRASES = [
  {
    frase: "Você não precisa ser a mais forte da sala. Só precisa aparecer.",
    tag: "Consistência"
  },
  {
    frase: "Aqui ninguém te julga. Aqui todo mundo cresce.",
    tag: "Comunidade"
  },
  {
    frase: "Cada rep é uma escolha por você mesma.",
    tag: "Empoderamento"
  },
  {
    frase: "Mãe, profissional, mulher — e ainda assim, cuida de si. Isso é força.",
    tag: "Para você"
  },
  {
    frase: "O seu ritmo é o ritmo certo.",
    tag: "Respeito"
  },
  {
    frase: "Treinar aqui é um ato de amor próprio.",
    tag: "Autocuidado"
  },
  {
    frase: "Você começou. Isso já é mais do que a maioria faz.",
    tag: "Coragem"
  },
  {
    frase: "Seu corpo é seu. Cuide dele do jeito que você merece.",
    tag: "Pertencimento"
  },
  {
    frase: "A academia que entende que você tem vida além da academia.",
    tag: "M&K"
  },
  {
    frase: "Não existe corpo errado para estar aqui.",
    tag: "Inclusão"
  },
];

export default function ManifestoBanner() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % FRASES.length);
        setVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    setIndex(dayOfYear % FRASES.length);
  }, []);

  const atual = FRASES[index];

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a] p-5 shadow-md">
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-[#D4537E] opacity-10 -mr-8 -mt-8 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-[#D4537E] opacity-10 -ml-6 -mb-6 pointer-events-none" />

      <div
        className="relative z-10 transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-[#D4537E] bg-[#D4537E]/10 px-3 py-1 rounded-full mb-3">
          {atual.tag}
        </span>

        <p className="text-white text-[15px] font-medium leading-relaxed">
          "{atual.frase}"
        </p>

        <p className="text-[#D4537E] text-xs font-semibold mt-3 tracking-wide">
          — M&K Fitness Center
        </p>
      </div>

      <div className="flex gap-1 mt-4 relative z-10">
        {FRASES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setVisible(false);
              setTimeout(() => { setIndex(i); setVisible(true); }, 400);
            }}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === index ? '20px' : '6px',
              backgroundColor: i === index ? '#D4537E' : 'rgba(255,255,255,0.2)',
            }}
            aria-label={`Frase ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}