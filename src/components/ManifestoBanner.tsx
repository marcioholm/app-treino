'use client';

import { useState, useEffect } from 'react';

const FRASES = [
  {
    frase: "Você não precisa ser a mais forte da sala. Só precisa aparecer.",
    tag: "Consistência",
    icon: "✨"
  },
  {
    frase: "Aqui ninguém te julga. Aqui todo mundo cresce.",
    tag: "Comunidade",
    icon: "💜"
  },
  {
    frase: "Cada rep é uma escolha por você mesma.",
    tag: "Empoderamento",
    icon: "💪"
  },
  {
    frase: "Mãe, profissional, mulher — e ainda assim, cuida de si. Isso é força.",
    tag: "Para Você",
    icon: "🌟"
  },
  {
    frase: "O seu ritmo é o ritmo certo.",
    tag: "Respeito",
    icon: "🧘"
  },
  {
    frase: "Treinar aqui é um ato de amor próprio.",
    tag: "Autocuidado",
    icon: "❤️"
  },
  {
    frase: "Você começou. Isso já é mais do que a maioria faz.",
    tag: "Coragem",
    icon: "🚀"
  },
  {
    frase: "Seu corpo é seu. Cuide dele do jeito que você merece.",
    tag: "Pertencimento",
    icon: "💕"
  },
  {
    frase: "A academia que entende que você tem vida além da academia.",
    tag: "M&K",
    icon: "🏋️"
  },
  {
    frase: "Não existe corpo errado para estar aqui.",
    tag: "Inclusão",
    icon: "🌈"
  },
];

export default function ManifestoBanner() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % FRASES.length);
        setIsVisible(true);
      }, 400);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  useEffect(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    setIndex(dayOfYear % FRASES.length);
  }, []);

  const current = FRASES[index];

  return (
    <div 
      style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(212, 83, 126, 0.15)',
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #D4537E 0%, #993556 100%)',
        opacity: 0.15,
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        left: '-20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #D4537E 0%, #993556 100%)',
        opacity: 0.1,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#D4537E',
            backgroundColor: 'rgba(212, 83, 126, 0.15)',
            padding: '6px 12px',
            borderRadius: '20px',
          }}>
            <span>{current.icon}</span>
            <span>{current.tag}</span>
          </span>
        </div>

        {/* Quote */}
        <div 
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.4s ease-out',
          }}
        >
          <p style={{
            fontSize: '18px',
            fontWeight: '500',
            lineHeight: '1.5',
            color: '#ffffff',
            marginBottom: '12px',
          }}>
            "{current.frase}"
          </p>
          
          <p style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#D4537E',
            letterSpacing: '0.05em',
          }}>
            — M&K Fitness Center
          </p>
        </div>

        {/* Dots indicator */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginTop: '20px',
        }}>
          {FRASES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsAutoPlaying(false);
                setIsVisible(false);
                setTimeout(() => {
                  setIndex(i);
                  setIsVisible(true);
                }, 150);
              }}
              style={{
                height: '6px',
                borderRadius: '3px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: i === index ? '24px' : '6px',
                backgroundColor: i === index ? '#D4537E' : 'rgba(255, 255, 255, 0.3)',
              }}
              aria-label={`Ver frase ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}