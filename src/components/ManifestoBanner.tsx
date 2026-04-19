'use client';

export default function ManifestoBanner() {
  return (
    <div className="h-full w-full bg-black flex flex-col justify-center items-start overflow-y-auto no-scrollbar relative p-8 md:p-16 lg:p-24 border-r border-[#1a1a1a]">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#E11383] opacity-10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#E11383] opacity-5 blur-[100px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 max-w-2xl text-left space-y-6">
        <h2 className="text-[#E11383] text-sm tracking-[0.3em] font-black uppercase mb-12">
          M&K Fitness Center
        </h2>

        <p className="text-white text-3xl font-black italic tracking-tight leading-tight">
          "Aqui, você não precisa estar pronta.<br />
          <span className="text-[#E11383]">Você só precisa começar.</span>"
        </p>

        <div className="space-y-5 text-gray-400 text-lg leading-relaxed mt-10 font-medium">
          <p>
            A gente sabe que nem sempre é fácil. A rotina é corrida. O tempo é curto. E muitas vezes, a vontade vem acompanhada de insegurança.
            Insegurança com o corpo. Com o olhar dos outros. Com aquele sentimento de não pertencer.
          </p>
          <p>
            A verdade é que muitas mulheres já desistiram antes mesmo de começar. Não por falta de vontade… Mas porque nunca encontraram um lugar onde se sentissem à vontade.
          </p>
          <p>
            E muitas outras nem começaram. Porque são mães. Porque não têm com quem deixar os filhos. Porque colocaram todo mundo na frente… E acabaram se deixando por último.
          </p>

          <p className="text-white font-bold text-2xl pt-4">
            Foi por isso que a M&K nasceu. Para ser diferente.
          </p>

          <p>
            Uma <span className="text-white font-semibold">comunidade de mulher para mulher</span>. Um espaço onde você não precisa se comparar. Não precisa se provar. Não precisa se encaixar em padrão nenhum.
            Aqui, cada mulher tem seu tempo. Seu ritmo. Sua história.
          </p>

          <div className="pl-6 border-l-4 border-[#E11383] my-8 py-2">
            <p className="text-white font-semibold text-xl">
              O treino não é sobre pressão. <span className="text-gray-400 font-normal">É sobre constância.</span><br />
              Não é sobre perfeição. <span className="text-gray-400 font-normal">É sobre evolução.</span>
            </p>
          </div>

          <p>
            E sim, aqui você pode cuidar de você… sem precisar abrir mão de quem você ama.<br />
            Porque a gente acredita que ser mãe não pode ser o motivo para você parar — mas sim mais um motivo para continuar.
          </p>

          <p>
            Acreditamos que cuidar da saúde vai muito além da estética. É sobre se sentir bem. Ter energia. Ter confiança. Voltar a olhar pra si mesma com carinho.<br />
            A gente entende a sua rotina. A gente entende seus desafios. E a gente criou um espaço que cabe na sua realidade.
          </p>

          <p className="text-white font-medium text-xl pt-2">
            Um espaço seguro. Acolhedor. Sem julgamentos.
          </p>
          <p className="text-[#E11383] font-bold text-xl pb-6">
            Aqui, você não treina sozinha. Aqui, você faz parte de algo.
          </p>
          
          <p className="italic text-gray-400">Porque no fim das contas…</p>
          
          <p className="text-white text-3xl font-black italic tracking-tight">
            não é sobre ser perfeita.<br />
            <span className="text-[#E11383]">É sobre se cuidar.</span>
          </p>

        </div>

        <div className="mt-16 pt-8 border-t border-[#333333]">
          <h3 className="text-white font-black text-xl">M&K Fitness Center</h3>
          <p className="text-gray-400 text-sm mt-1">Uma comunidade de mulher para mulher.<br />Seu espaço para cuidar de você.</p>
        </div>
      </div>
    </div>
  );
}