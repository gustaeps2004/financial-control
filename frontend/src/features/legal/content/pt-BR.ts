import { COMPANY } from "../company";
import type { LegalDocuments } from "./types";

// The text that applies: Brazilian law (CDC, art. 31) wants consumers informed
// in Portuguese. Any change here needs the same change in en.ts and a new
// LEGAL_UPDATED_ON.

const EMAIL = `[${COMPANY.email}](mailto:${COMPANY.email})`;
const GOOGLE_PRIVACY =
  "[Política de Privacidade do Google](https://policies.google.com/privacy?hl=pt-BR)";

export const legalPtBR: LegalDocuments = {
  translationNotice: null,

  terms: {
    title: "Termos de Uso",
    intro: [
      `Estes Termos de Uso regem o uso do Fecha Mês, aplicativo web de organização financeira pessoal oferecido pela ${COMPANY.name}, inscrita no CNPJ sob o nº ${COMPANY.cnpj} (“nós”). Ao criar uma conta, você declara que leu e concorda com estes Termos e que conhece a nossa [Política de Privacidade](/privacy), que explica como tratamos os seus dados pessoais.`,
    ],
    sections: [
      {
        id: "service",
        title: "O que é o Fecha Mês",
        blocks: [
          "O Fecha Mês ajuda você a organizar o seu dinheiro: você registra entradas, contas fixas, compras à vista e no crédito, faturas de cartão e lançamentos que se repetem todo mês, e o app calcula totais, saldos e resumos mensais e anuais a partir do que você informou.",
          "O uso do Fecha Mês é gratuito. Se um dia houver funcionalidades pagas, elas serão opcionais, com preço e condições informados com clareza antes da contratação, e nada será cobrado sem a sua concordância expressa.",
          {
            highlight:
              "O Fecha Mês não é banco, instituição de pagamento nem consultoria financeira. Ele não se conecta às suas contas bancárias, não movimenta dinheiro, não paga contas e não faz recomendações de investimento, crédito ou impostos. Marcar uma conta como paga é só uma anotação sua: o pagamento continua sendo feito por você, no seu banco ou aplicativo de pagamento.",
          },
        ],
      },
      {
        id: "eligibility",
        title: "Quem pode usar",
        blocks: [
          "Para criar uma conta, você precisa ter pelo menos 18 anos e ser capaz de assumir as obrigações destes Termos.",
          "A conta é pessoal e intransferível: use-a para organizar as suas próprias finanças e informe dados verdadeiros no cadastro.",
        ],
      },
      {
        id: "account",
        title: "Sua conta e seu acesso",
        blocks: [
          "Você pode entrar com e-mail e senha ou com a sua conta Google. Em qualquer caso, você é responsável por manter as suas credenciais em sigilo e pelo que for feito com elas.",
          {
            list: [
              "Use uma senha forte, que você não use em outros serviços.",
              "Em computadores compartilhados, não marque “Lembrar de mim” e saia da conta ao terminar.",
              `Se suspeitar que alguém acessou a sua conta, fale com a gente imediatamente pelo e-mail ${EMAIL}.`,
            ],
          },
        ],
      },
      {
        id: "acceptable-use",
        title: "Uso permitido",
        blocks: [
          "Use o Fecha Mês de boa-fé e de acordo com a lei. Não é permitido:",
          {
            list: [
              "acessar ou tentar acessar contas, dados ou sistemas que não sejam seus;",
              "contornar, testar ou explorar as medidas de segurança do serviço sem a nossa autorização;",
              "sobrecarregar ou prejudicar o funcionamento do serviço, inclusive com acessos automatizados em massa;",
              "usar o serviço para atividades ilícitas ou para se passar por outra pessoa.",
            ],
          },
        ],
      },
      {
        id: "your-records",
        title: "Seus registros",
        blocks: [
          "As informações que você registra no Fecha Mês são suas. Nós as usamos apenas para prestar o serviço a você, como descrito na [Política de Privacidade](/privacy), e não as vendemos nem as usamos para publicidade.",
          "Você é responsável pela exatidão do que registra. Os totais, saldos e resumos refletem os valores, datas e categorias informados por você.",
        ],
      },
      {
        id: "availability",
        title: "Disponibilidade e mudanças no serviço",
        blocks: [
          "Trabalhamos para manter o Fecha Mês disponível e funcionando bem, mas o serviço pode ficar fora do ar temporariamente para manutenção ou atualizações, por falhas de fornecedores ou da internet, ou por caso fortuito ou força maior.",
          "Podemos mudar, incluir ou retirar funcionalidades para melhorar o serviço. Mudanças que afetem de forma relevante o seu uso serão avisadas com antecedência sempre que possível.",
          "Se decidirmos encerrar o Fecha Mês, avisaremos com pelo menos 30 dias de antecedência, e você poderá pedir uma cópia dos seus dados antes do encerramento.",
        ],
      },
      {
        id: "liability",
        title: "Responsabilidades",
        blocks: [
          "Respondemos pelo serviço que prestamos nos termos da lei, inclusive do Código de Defesa do Consumidor (Lei nº 8.078/1990). Nada nestes Termos exclui ou limita direitos que a lei garante a você.",
          {
            highlight:
              "Como os números do Fecha Mês são calculados a partir do que você registra, não respondemos por resultados de informações incorretas, incompletas ou desatualizadas inseridas por você, nem pelas decisões financeiras que você tomar com base nelas.",
          },
          {
            highlight:
              "Também não respondemos por danos causados pelo uso da sua conta por terceiros quando isso decorrer de falha sua em manter as suas credenciais em sigilo.",
          },
        ],
      },
      {
        id: "intellectual-property",
        title: "Propriedade intelectual",
        blocks: [
          `O software, o nome, a marca, o visual e os textos do Fecha Mês pertencem à ${COMPANY.name} e são protegidos pelas leis de direitos autorais, de software e de propriedade industrial. Enquanto você tiver uma conta, concedemos a você uma licença pessoal, gratuita, não exclusiva e intransferível para usar o serviço conforme estes Termos.`,
          "Essa licença não inclui copiar, modificar, distribuir ou explorar comercialmente o Fecha Mês ou partes dele.",
        ],
      },
      {
        id: "termination",
        title: "Encerramento da conta",
        blocks: [
          "Você pode deixar de usar o Fecha Mês quando quiser e excluir a sua conta a qualquer momento em Configurações → Zona de perigo → Excluir conta.",
          {
            highlight:
              "A exclusão é definitiva: a conta e todos os registros ligados a ela são apagados e não podem ser recuperados.",
          },
          "Podemos suspender ou encerrar contas usadas em violação destes Termos ou da lei. Sempre que possível e permitido, avisaremos antes e explicaremos o motivo.",
        ],
      },
      {
        id: "changes",
        title: "Alterações destes Termos",
        blocks: [
          "Podemos atualizar estes Termos para refletir mudanças no serviço ou na legislação. A versão em vigor fica sempre nesta página, com a data da última atualização.",
          "Avisaremos as mudanças relevantes com antecedência, pelo próprio Fecha Mês. Se não concordar com a nova versão, você pode excluir a sua conta antes que ela entre em vigor, sem nenhum custo. Quando a lei exigir, pediremos o seu aceite expresso.",
        ],
      },
      {
        id: "law",
        title: "Lei aplicável e foro",
        blocks: [
          "Estes Termos são regidos pelas leis brasileiras. Eventuais disputas serão resolvidas no foro do seu domicílio, como assegura o Código de Defesa do Consumidor.",
        ],
      },
      {
        id: "contact",
        title: "Contato",
        blocks: [
          `Dúvidas, sugestões ou reclamações sobre estes Termos: ${EMAIL}. Vamos fazer o possível para resolver tudo rapidamente.`,
          `${COMPANY.name} — CNPJ ${COMPANY.cnpj}`,
        ],
      },
    ],
  },

  privacy: {
    title: "Política de Privacidade",
    intro: [
      "Esta Política explica, de forma simples, quais dados pessoais o Fecha Mês trata, para quê, com quem eles são compartilhados e como você exerce os seus direitos, conforme a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014).",
      "Em resumo: usamos os seus dados só para fazer o Fecha Mês funcionar para você. Não vendemos dados, não mostramos anúncios e não nos conectamos ao seu banco.",
    ],
    sections: [
      {
        id: "controller",
        title: "Quem é o responsável pelos seus dados",
        blocks: [
          `O controlador dos seus dados pessoais — quem decide como e por que eles são tratados — é a ${COMPANY.name}, inscrita no CNPJ sob o nº ${COMPANY.cnpj}.`,
          `Para exercer os seus direitos ou tratar de qualquer assunto sobre os seus dados pessoais, escreva para ${EMAIL}. Esse é o canal oficial de atendimento aos titulares de dados do Fecha Mês.`,
        ],
      },
      {
        id: "data",
        title: "Quais dados tratamos",
        blocks: [
          {
            terms: [
              {
                term: "Dados de cadastro",
                description:
                  "Nome, e-mail e senha. A senha nunca é guardada do jeito que você a digita: armazenamos apenas um código irreversível gerado a partir dela (hash, com o algoritmo argon2).",
              },
              {
                term: "Dados do Google, se você entrar com o Google",
                description:
                  "O identificador da sua conta Google, o seu e-mail, a confirmação de que ele foi verificado pelo Google e o seu nome. Não recebemos a sua senha do Google nem acesso a e-mails, contatos, arquivos ou outros dados da sua conta Google.",
              },
              {
                term: "Seus registros financeiros",
                description:
                  "Tudo o que você cadastra no app: categorias; cartões (banco ou bandeira, apelido, cor, limite, dias de fechamento e de vencimento e saldo inicial); lançamentos (data, descrição, valor, categoria, forma de pagamento e cartão); lançamentos recorrentes; pagamentos e ajustes de faturas; e as contas que você marca como pagas.",
              },
              {
                term: "Registros de acesso e de aceite",
                description:
                  "A data e a hora de cada entrada na sua conta e de quando essa sessão expira, além do registro de que você aceitou estes documentos ao criar a conta.",
              },
              {
                term: "Dados técnicos",
                description:
                  "Para funcionar e se proteger, os nossos provedores de hospedagem registram dados técnicos das requisições, como endereço IP, data e hora, endereço acessado e informações do navegador. O próprio Fecha Mês não grava o seu endereço IP.",
              },
            ],
          },
          "Não pedimos nem guardamos números de cartão, senhas de banco, CPF ou outros documentos, localização ou contatos.",
        ],
      },
      {
        id: "purposes",
        title: "Para que usamos os dados e com qual base legal",
        blocks: [
          "Cada uso tem uma base legal prevista no art. 7º da LGPD:",
          {
            terms: [
              {
                term: "Criar e manter a sua conta e permitir que você entre nela",
                description:
                  "Dados de cadastro e, se for o caso, do Google. Base legal: execução de contrato (art. 7º, V).",
              },
              {
                term: "Guardar os seus registros e calcular totais, saldos e resumos",
                description: "Registros financeiros. Base legal: execução de contrato (art. 7º, V).",
              },
              {
                term: "Proteger a sua conta e o serviço contra acessos indevidos, abusos e falhas",
                description:
                  "Registros de acesso e dados técnicos. Base legal: legítimo interesse (art. 7º, IX), sempre respeitando os seus direitos e as suas expectativas.",
              },
              {
                term: "Comprovar que você aceitou os Termos de Uso e esta Política",
                description:
                  "Registro de aceite. Base legal: exercício regular de direitos (art. 7º, VI).",
              },
              {
                term: "Responder aos seus pedidos e dúvidas",
                description:
                  "Os dados necessários ao seu pedido. Base legal: cumprimento de obrigação legal (art. 7º, II), nos pedidos sobre os seus direitos, e execução de contrato (art. 7º, V), nos demais.",
              },
              {
                term: "Cumprir obrigações legais e ordens de autoridades",
                description:
                  "Os dados exigidos em cada caso. Base legal: cumprimento de obrigação legal ou regulatória (art. 7º, II).",
              },
            ],
          },
          "Não usamos os seus dados para publicidade, não traçamos perfis de comportamento e não tomamos decisões automatizadas que afetem os seus interesses. Os cálculos do app apenas somam e organizam o que você registrou.",
        ],
      },
      {
        id: "sharing",
        title: "Com quem compartilhamos",
        blocks: [
          "Não vendemos nem alugamos os seus dados. Eles só são compartilhados com:",
          {
            terms: [
              { term: "Vercel Inc.", description: "Hospeda o site e a API do Fecha Mês." },
              {
                term: "BorkCloud",
                description: "Hospeda o banco de dados onde ficam a sua conta e os seus registros.",
              },
              {
                term: "Google LLC",
                description: `Somente se você escolher entrar com o Google: o Google confirma a sua identidade para nós. O que acontece do lado do Google segue a ${GOOGLE_PRIVACY}.`,
              },
              {
                term: "Autoridades públicas",
                description:
                  "Quando houver obrigação legal, ordem judicial ou requisição de autoridade competente, nos limites da lei.",
              },
            ],
          },
          "Os provedores de infraestrutura atuam como operadores: tratam os dados apenas para prestar o serviço que contratamos deles, conforme as nossas instruções.",
          "Se o Fecha Mês passar por uma reorganização societária, como fusão ou venda, os dados poderão ser transferidos à empresa sucessora, que continuará obrigada a esta Política.",
        ],
      },
      {
        id: "international-transfer",
        title: "Transferência internacional",
        blocks: [
          "Parte da nossa infraestrutura fica fora do Brasil: a Vercel, por exemplo, processa dados nos Estados Unidos. Essas transferências são necessárias para prestar o serviço que você contratou (art. 33, IX, da LGPD) e são feitas com fornecedores que adotam medidas de segurança e de proteção de dados compatíveis com a LGPD.",
        ],
      },
      {
        id: "retention",
        title: "Por quanto tempo guardamos",
        blocks: [
          "Guardamos os seus dados enquanto a sua conta existir.",
          "Quando você exclui a conta em Configurações → Zona de perigo → Excluir conta, apagamos na hora e de forma definitiva a conta e todos os registros ligados a ela: lançamentos, cartões, categorias, recorrentes, faturas e registros de acesso. Nada é mantido depois disso, salvo se a lei ou uma ordem judicial exigir a guarda de algum dado específico (art. 16 da LGPD).",
          "Cópias de segurança (backups) e registros técnicos mantidos pelos nossos provedores podem conter os seus dados por um período limitado, até serem eliminados automaticamente pelo ciclo de cada provedor. Eles não são usados para nenhuma outra finalidade.",
        ],
      },
      {
        id: "device-storage",
        title: "Cookies e armazenamento no seu navegador",
        blocks: [
          "O Fecha Mês não usa cookies de publicidade nem de análise de navegação. Para funcionar, ele guarda no armazenamento local do seu navegador:",
          {
            terms: [
              {
                term: "Sua sessão",
                description:
                  "Mantém você conectado. Se você marcar “Lembrar de mim”, ela fica guardada até você sair da conta ou a sessão expirar; se não marcar, é apagada quando você fecha a aba ou o navegador.",
              },
              {
                term: "Seu idioma",
                description: "Lembra se você prefere o app em português ou em inglês.",
              },
              {
                term: "Seu nome e as suas preferências",
                description:
                  "Permitem cumprimentar você pelo nome na tela de entrada e lembrar as preferências escolhidas em Configurações, neste aparelho.",
              },
            ],
          },
          "Essas informações ficam no seu aparelho, são necessárias para o funcionamento do serviço e são apagadas se você limpar os dados de navegação (o que também encerra a sua sessão). Excluir a conta apaga o nome e as preferências guardados no aparelho em que você a excluiu.",
          `Nas telas com o botão “Entrar com o Google”, o seu navegador carrega um script do Google, que pode usar cookies próprios conforme a ${GOOGLE_PRIVACY}.`,
        ],
      },
      {
        id: "security",
        title: "Segurança",
        blocks: [
          "Adotamos medidas técnicas e administrativas para proteger os seus dados, entre elas:",
          {
            list: [
              "conexão criptografada (HTTPS) entre o seu navegador e os nossos servidores;",
              "senhas guardadas apenas como hash argon2, algoritmo próprio para senhas;",
              "sessões com prazo de validade e acesso a cada registro limitado à conta dona dele;",
              "acesso à infraestrutura restrito a pessoas autorizadas.",
            ],
          },
          "Nenhum sistema é totalmente imune a falhas. Se ocorrer um incidente de segurança que possa trazer risco ou dano relevante a você, avisaremos você e a Autoridade Nacional de Proteção de Dados (ANPD), como determinam o art. 48 da LGPD e a regulamentação da ANPD.",
        ],
      },
      {
        id: "rights",
        title: "Seus direitos",
        blocks: [
          "A LGPD (art. 18) garante a você, a qualquer momento e sem custo, o direito de:",
          {
            list: [
              "confirmar se tratamos os seus dados e acessar esses dados;",
              "corrigir dados incompletos, inexatos ou desatualizados;",
              "pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;",
              "pedir a portabilidade dos seus dados a outro fornecedor;",
              "pedir a eliminação dos dados tratados com base no seu consentimento;",
              "saber com quais entidades públicas e privadas compartilhamos os seus dados;",
              "ser informado sobre a possibilidade de não dar consentimento e sobre as consequências disso;",
              "revogar o consentimento, quando ele for a base do tratamento;",
              "opor-se a um tratamento feito com base em outra hipótese legal, se ele descumprir a LGPD;",
              "pedir a revisão de decisões tomadas unicamente com base em tratamento automatizado (art. 20) — algo que o Fecha Mês hoje não faz.",
            ],
          },
          `Muita coisa você resolve direto no app: editar o seu nome em Configurações, corrigir ou apagar qualquer registro e excluir a conta com tudo o que ela contém. Para os demais pedidos — como receber uma cópia dos seus dados —, escreva para ${EMAIL} a partir do e-mail cadastrado na sua conta, para confirmarmos que o pedido é seu.`,
          "Responderemos de imediato, quando for possível em formato simplificado, ou em até 15 dias com a declaração completa (art. 19 da LGPD).",
          "Se achar que os seus direitos não foram atendidos, você também pode peticionar à [ANPD](https://www.gov.br/anpd/pt-br) e procurar os órgãos de defesa do consumidor.",
        ],
      },
      {
        id: "children",
        title: "Crianças e adolescentes",
        blocks: [
          "O Fecha Mês é destinado a maiores de 18 anos. Não coletamos de propósito dados de crianças ou adolescentes; se soubermos que uma conta pertence a alguém com menos de 18 anos, ela será excluída.",
        ],
      },
      {
        id: "sensitive-data",
        title: "Dados sensíveis",
        blocks: [
          "Não pedimos dados pessoais sensíveis, como os de saúde, religião, opinião política ou origem racial (art. 5º, II, da LGPD). Como as descrições dos lançamentos são de texto livre, evite incluir esse tipo de informação nelas; se incluir, ela será usada apenas para mostrar os seus registros a você.",
        ],
      },
      {
        id: "changes",
        title: "Alterações desta Política",
        blocks: [
          "Podemos atualizar esta Política para refletir mudanças no serviço ou na lei. A versão em vigor fica sempre nesta página, com a data da última atualização, e avisaremos as mudanças relevantes com antecedência, pelo próprio Fecha Mês.",
        ],
      },
      {
        id: "contact",
        title: "Contato",
        blocks: [
          `Dúvidas, pedidos ou reclamações sobre privacidade: ${EMAIL}.`,
          `${COMPANY.name} — CNPJ ${COMPANY.cnpj}`,
        ],
      },
    ],
  },
};
