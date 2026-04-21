'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GradientButton } from '@/components/trainer/GradientButton';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Acompanhamento',
    description: 'Acompanhe a evolução das suas alunas com métricas detalhadas e históricos completos.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'IA Integrada',
    description: 'Geramos treinos personalizados automaticamente usando inteligência artificial.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Mobile First',
    description: 'Interface otimizada para smartphones. Suas alunas treinam de qualquer lugar.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Comunidade',
    description: 'Um espaço seguro de mulher para mulher. Conecte-se com outras atletas.'
  }
];

const testimonials = [
  {
    name: 'Camila Silva',
    role: 'Aluna há 8 meses',
    text: 'Perdi 12kg seguindo os treinos da minha personal. O app facilita demais!',
    avatar: 'C'
  },
  {
    name: 'Juliana Santos',
    role: 'Aluna há 1 ano',
    text: 'Acompanhar minha evolução pelo app me motiva muito. Adoro os check-ins semanais.',
    avatar: 'J'
  },
  {
    name: 'Patrícia Oliveira',
    role: 'Aluna há 6 meses',
    text: 'Finalmente um app feito para mulheres. O design é lindo e muito fácil de usar.',
    avatar: 'P'
  }
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="size-10 md:size-12 rounded-full bg-gradient-brand grid place-items-center ring-2 ring-primary-light">
                <span className="font-display font-bold text-white text-sm md:text-base">M&K</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-white text-lg leading-none">M&K</span>
                <span className="text-primary text-[10px] font-semibold tracking-widest uppercase">Fitness</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <a href="#features" className="text-white/70 hover:text-white font-medium transition">Funcionalidades</a>
              <a href="#depoimentos" className="text-white/70 hover:text-white font-medium transition">Depoimentos</a>
              <Link href="/login">
                <GradientButton variant="ghost-light" size="sm">Entrar</GradientButton>
              </Link>
              <Link href="/login?register=true">
                <GradientButton size="sm">Começar Agora</GradientButton>
              </Link>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <Link href="/login">
                <GradientButton size="sm">Entrar</GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-dark">
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(240_30%_8%)_70%)]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-soft/50 border border-primary/20 mb-6 md:mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-primary-foreground font-medium">Comunidade feminina de fitness</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6">
              Seu espaço seguro para{' '}
              <span className="text-gradient-brand">treinar e evoluir</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10">
              Uma comunidade de mulher para mulher. Treinos personalizados, 
              acompanhamento profissional e tecnologia de ponta.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login?register=true">
                <GradientButton size="lg" className="w-full sm:w-auto">
                  Criar Conta Grátis
                </GradientButton>
              </Link>
              <Link href="/login">
                <GradientButton variant="outline" size="lg" className="w-full sm:w-auto">
                  Já tenho conta
                </GradientButton>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 md:mt-16 pt-8 md:pt-12 border-t border-white/10">
              <div>
                <div className="font-display text-2xl md:text-4xl font-bold text-white">500+</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Alunas.ativas</div>
              </div>
              <div>
                <div className="font-display text-2xl md:text-4xl font-bold text-white">98%</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Satisfaction</div>
              </div>
              <div>
                <div className="font-display text-2xl md:text-4xl font-bold text-white">50+</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Personal trainers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-surface-alt">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="label-caps text-primary mb-3 inline-block">Funcionalidades</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para{' '}
              <span className="text-gradient-brand">transformar seu corpo</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Ferramentas profissionais desenvolvidas especificamente para o público feminino
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="group p-6 rounded-2xl bg-card border border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-pink-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-brand grid place-items-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-brand opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-white mb-4">
              Pronto para começar sua transformação?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Junte-se a centenas de mulheres que já estão conquistando seus objetivos
            </p>
            <Link href="/login?register=true">
              <GradientButton variant="solid" size="lg" className="bg-white text-primary hover:bg-white/90">
                Criar Conta Grátis
              </GradientButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-20 md:py-32 bg-surface-alt">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="label-caps text-primary mb-3 inline-block">Depoimentos</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
              O que nossas alunas dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border/40">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-12 rounded-full bg-gradient-brand grid place-items-center font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <p className="text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-dark border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-gradient-brand grid place-items-center">
                <span className="font-display font-bold text-white text-xs">M&K</span>
              </div>
              <span className="text-white/60 text-sm">© 2026 M&K Fitness Center</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition">Termos</a>
              <a href="#" className="hover:text-white transition">Privacidade</a>
              <a href="#" className="hover:text-white transition">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}