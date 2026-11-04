import { Book, ParsedBookContent } from '../types/reader';

export interface SampleBookBundle {
  book: Book;
  content: ParsedBookContent;
}

export const SAMPLE_BOOKS: SampleBookBundle[] = [
  {
    book: {
      id: 'sample_dom_casmurro',
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      totalPages: 4,
      totalWords: 1850,
      coverUrl: '',
      dateAdded: 1700000000000,
      lastReadTimestamp: 1700000000000,
      currentPage: 1,
      scrollProgress: 0,
      isSample: true,
    },
    content: {
      id: 'sample_dom_casmurro',
      toc: [
        { title: 'Capítulo I: Do Título', pageNumber: 1, level: 1 },
        { title: 'Capítulo II: Do Livro', pageNumber: 2, level: 1 },
        { title: 'Capítulo III: A Denúncia', pageNumber: 3, level: 1 },
        { title: 'Capítulo IV: Um Dever Amargo', pageNumber: 4, level: 1 },
      ],
      pages: [
        {
          pageNumber: 1,
          wordCount: 420,
          rawText: '',
          blocks: [
            {
              id: 'dc_1_1',
              type: 'h1',
              text: 'Capítulo I — Do Título',
              pageNumber: 1,
            },
            {
              id: 'dc_1_2',
              type: 'p',
              text: 'Uma noite destas, vindo da cidade para o Engenho Novo, encontrei no trem da Central um rapaz aqui do bairro, que eu conheço de vista e de chapéu. Cumprimentou-me, sentou-se ao pé de mim, falou da lua e dos ministros, e acabou recitando-me versos. A viagem era curta, e os versos pode ser que não fossem inteiramente maus, porém o caso é que eu ia cansado, fechei os olhos, cochilei. Quando acordei, o rapaz tinha acabado e olhava para mim com ar desconsolado.',
              pageNumber: 1,
            },
            {
              id: 'dc_1_3',
              type: 'p',
              text: 'No dia seguinte, os vizinhos, que não gostam dos meus hábitos reclusos e calados, deram-me a alcunha de Dom Casmurro. Os rapazes da vizinhança chamam-me assim; os velhos, com mais respeito, dizem que sou um homem de bem, mas esquivo.',
              pageNumber: 1,
            },
            {
              id: 'dc_1_4',
              type: 'p',
              text: 'Não consultes os dicionários. Casmurro não está aqui no sentido que eles lhe dão, mas no que lhe pôs o vulgo de homem calado e metido consigo. Dom veio por ironia, para atribuir-me fumos de fidalgo. Tudo por estar cochilando!',
              pageNumber: 1,
            },
            {
              id: 'dc_1_5',
              type: 'p',
              text: 'Também não foi só isso; há coisas que se juntam para formar um apelido ou uma reputação. Aceitei a alcunha de bom grado. Não me queixo.',
              pageNumber: 1,
            },
          ],
        },
        {
          pageNumber: 2,
          wordCount: 450,
          rawText: '',
          blocks: [
            {
              id: 'dc_2_1',
              type: 'h1',
              text: 'Capítulo II — Do Livro',
              pageNumber: 2,
            },
            {
              id: 'dc_2_2',
              type: 'p',
              text: 'Agora que expliquei o título, passo a escrever o livro. Para isso, vá de confessar que estive a ponto de não o escrever. Não que me faltassem materiais, mas porque a memória às vezes é uma lâmpada fraca e vacilante.',
              pageNumber: 2,
            },
            {
              id: 'dc_2_3',
              type: 'p',
              text: 'O meu fim evidente era atar as duas pontas da vida, e restaurar na velhice a adolescência. Pois, senhor, não consegui recompor o que foi nem o que fui. Em tudo, se o rosto é quase o mesmo, a expressão é diferente. Se fosse só com os outros, vá; mas a mim mesmo me desconheço muitas vezes.',
              pageNumber: 2,
            },
            {
              id: 'dc_2_4',
              type: 'p',
              text: 'Entretanto, a vida é uma loteria contínua; a gente compra o bilhete sem saber o número nem o prêmio. Escrever estas memórias é reviver as horas doces e amargas, sentir novamente os perfumes do quintal de Matacavalos e os primeiros sobressaltos do coração.',
              pageNumber: 2,
            },
          ],
        },
        {
          pageNumber: 3,
          wordCount: 510,
          rawText: '',
          blocks: [
            {
              id: 'dc_3_1',
              type: 'h1',
              text: 'Capítulo III — A Denúncia',
              pageNumber: 3,
            },
            {
              id: 'dc_3_2',
              type: 'p',
              text: 'Ia a entrar na sala de visitas, quando ouvi proferir o meu nome e escondi-me atrás da porta. A casa era a da Rua de Matacavalos, o mês novembro, o ano é que é um tanto remoto, mas eu não hei de trocar as datas da minha vida só para agradar aos que não amam velhas cronologias; era em 1857.',
              pageNumber: 3,
            },
            {
              id: 'dc_3_3',
              type: 'p',
              text: '— D. Glória, a senhora persiste na ideia de meter o Bentinho no seminário? É mais que tempo, e já agora pode haver uma dificuldade.',
              pageNumber: 3,
            },
            {
              id: 'dc_3_4',
              type: 'p',
              text: '— Que dificuldade?',
              pageNumber: 3,
            },
            {
              id: 'dc_3_5',
              type: 'p',
              text: '— Uma grande dificuldade, minha senhora. O Bentinho anda muito nos cantos com a filha do Pádua, e andam de cochichos. Se a senhora não cuida logo nisto, é capaz de vê-los casados antes de o rapaz ir para São Leopoldo!',
              pageNumber: 3,
            },
            {
              id: 'dc_3_6',
              type: 'p',
              text: 'Quem falava era José Dias, o nosso agregado. Minha mãe estremeceu. Era uma promessa sagrada que ela fizera a Deus: se tivesse um segundo filho varão, este seria padre.',
              pageNumber: 3,
            },
          ],
        },
        {
          pageNumber: 4,
          wordCount: 470,
          rawText: '',
          blocks: [
            {
              id: 'dc_4_1',
              type: 'h1',
              text: 'Capítulo IV — Um Dever Amargo',
              pageNumber: 4,
            },
            {
              id: 'dc_4_2',
              type: 'p',
              text: 'Capitu era mais moça do que eu um ano e meio. Vivia na casa vizinha, cuja cerca de taquaras nos deixava conversar livremente todos os dias. Seus olhos de ressaca, que o mar revolto parecia ter emprestado para enfeitiçar as gentes, tinham um poder estranho sobre mim.',
              pageNumber: 4,
            },
            {
              id: 'dc_4_3',
              type: 'p',
              text: 'Naquele dia, ao saber que podiam nos separar pelo claustro do seminário, meu peito apertou-se com a força de um furacão. Corri até o muro de taquaras para encontrá-la, com os passos vacilantes e a certeza de que a infância chegara irremediavelmente ao seu crepúsculo.',
              pageNumber: 4,
            },
            {
              id: 'dc_4_4',
              type: 'p',
              text: 'Capitu olhou-me com aquela calma resoluta que me desarmava. Não parecia temer o destino nem o agregado. Ela sabia, desde sempre, que o futuro pertencia aos que sabem olhar firme.',
              pageNumber: 4,
            },
          ],
        },
      ],
    },
  },
  {
    book: {
      id: 'sample_guia_leitor',
      title: 'Manual do Leitor Adaptativo para Telas',
      author: 'Equipe do Aplicativo',
      totalPages: 3,
      totalWords: 920,
      coverUrl: '',
      dateAdded: 1700000001000,
      lastReadTimestamp: 1700000001000,
      currentPage: 1,
      scrollProgress: 0,
      isSample: true,
    },
    content: {
      id: 'sample_guia_leitor',
      toc: [
        { title: '1. O que é o Modo Reflow?', pageNumber: 1, level: 1 },
        { title: '2. Ajustes de Fonte e Modo Noturno', pageNumber: 2, level: 1 },
        { title: '3. Narração em Áudio e Leitura Biônica', pageNumber: 3, level: 1 },
      ],
      pages: [
        {
          pageNumber: 1,
          wordCount: 280,
          rawText: '',
          blocks: [
            {
              id: 'guide_1_1',
              type: 'h1',
              text: '1. Por que Ler PDF em Telas Pequenas é Difícil?',
              pageNumber: 1,
            },
            {
              id: 'guide_1_2',
              type: 'p',
              text: 'O formato PDF foi inventado para reproduzir folhas de papel impressas com fidelidade estática milimétrica (geralmente formato A4 ou Carta). Quando você abre um PDF comum num smartphone ou tablet, as letras ficam minúsculas.',
              pageNumber: 1,
            },
            {
              id: 'guide_1_3',
              type: 'p',
              text: 'Para conseguir ler num aplicativo comum, o usuário precisa dar zoom com dois dedos e ficar arrastando o documento continuamente para a direita e para a esquerda a cada linha. Essa experiência cansa a vista e torna a leitura inviável.',
              pageNumber: 1,
            },
            {
              id: 'guide_1_4',
              type: 'h2',
              text: 'A Solução: Texto Fluído (Reflow Inteligente)',
              pageNumber: 1,
            },
            {
              id: 'guide_1_5',
              type: 'p',
              text: 'Este leitor extrai os blocos semânticos do PDF, remove cabeçalhos repetidos de página, conserta palavras quebradas por hífen e organiza o conteúdo em uma coluna de leitura perfeitamente adaptada à largura da sua tela.',
              pageNumber: 1,
            },
          ],
        },
        {
          pageNumber: 2,
          wordCount: 310,
          rawText: '',
          blocks: [
            {
              id: 'guide_2_1',
              type: 'h1',
              text: '2. Personalização Completa da Tipografia',
              pageNumber: 2,
            },
            {
              id: 'guide_2_2',
              type: 'p',
              text: 'Toque em qualquer lugar da tela ou no botão flutuante de configurações para ter controle total sobre a leitura:',
              pageNumber: 2,
            },
            {
              id: 'guide_2_3',
              type: 'p',
              text: '• Tamanho da Fonte: Aumente ou diminua instantaneamente entre 14px e 34px conforme sua preferência visual.',
              pageNumber: 2,
            },
            {
              id: 'guide_2_4',
              type: 'p',
              text: '• 5 Modos de Cor: Noturno Suave (Dark Slate), Preto Puro (AMOLED para economizar bateria em telas OLED), Sépia Livro (clássico tom quente de papel), Âmbar Quente (filtro de luz azul para a hora de dormir) e Claro Puro.',
              pageNumber: 2,
            },
            {
              id: 'guide_2_5',
              type: 'p',
              text: '• Fontes Selecionadas: Escolha entre Literata, Merriweather, Inter Sans e Atkinson Hyperlegible (desenhada especialmente para facilitar a leitura de pessoas com baixa visão ou dislexia).',
              pageNumber: 2,
            },
          ],
        },
        {
          pageNumber: 3,
          wordCount: 330,
          rawText: '',
          blocks: [
            {
              id: 'guide_3_1',
              type: 'h1',
              text: '3. Recursos Avançados para Celulares',
              pageNumber: 3,
            },
            {
              id: 'guide_3_2',
              type: 'p',
              text: '• Salvamento Automático Instantâneo: O aplicativo salva no seu navegador (IndexedDB) exatamente a página e o percentual de rolagem onde você parou. Feche a aba ou reinicie o celular e continue exatamente de onde parou!',
              pageNumber: 3,
            },
            {
              id: 'guide_3_3',
              type: 'p',
              text: '• Leitura Biônica: Quando ativada no menu Aa, destaca o início das palavras em negrito, permitindo que seus olhos e cérebro leiam até 2x mais rápido sem perder a compreensão.',
              pageNumber: 3,
            },
            {
              id: 'guide_3_4',
              type: 'p',
              text: '• Narração em Voz Alta (TTS): Ouça o livro enquanto descansa a vista ou caminha. O texto narrado é grifado em tempo real na tela.',
              pageNumber: 3,
            },
            {
              id: 'guide_3_5',
              type: 'p',
              text: '• Visualizador PDF Original: Caso queira conferir uma tabela ou figura exata da folha original, basta alternar no topo para a visão original de página.',
              pageNumber: 3,
            },
          ],
        },
      ],
    },
  },
];
