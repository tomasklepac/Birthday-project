export const PUBS = [
  {
    id: 'lokal',
    name: 'LOKÁL',
    reward: 6,
    game: 'pour',
    icon: '🍺',
    task: 'Vítej v Lokálu, prý nejlíp čepovaná plzeň ve městě! Tak ukaž, že to taky umíš. Načepuj jako profík.',
    praises: {
      good: 'Hostinský by ti záviděl! Perfektní pěna',
      ok: 'Ujde to, Lokál tě bere!',
      over: 'No, na učňák to ještě chce trénink, ale vypije se!',
    },
    transition: '+6 piv! První štace za tebou. Hurá na Pivoňku!',
  },
  {
    id: 'pivonka',
    name: 'PIVOŇKA',
    reward: 6,
    game: 'memory',
    icon: '🃏',
    task: 'Pivoňka, studentský sklep hluboko v podzemí. Žádný signál, jenom pivo. Na stole se válí tácky, najdeš všechny páry?',
    praises: {
      fast: 'Paměť jako slon!',
      done: 'Všechny páry sedí, výborně!',
    },
    transition: '+6 piv! Jde ti to. Šup do Ucha!',
  },
  {
    id: 'ucho',
    name: 'UCHO',
    reward: 6,
    game: 'slide',
    icon: '🎯',
    task: 'Ucho, velký studentský bar přímo na koleji. Je narváno a barman nestíhá. Hoď pivo přesně před zákazníka na konci baru!',
    praises: {
      // perfect = přesně před zákazníka
      perfect: 'Přesně před nos! Barman tě chce najmout.',
      // weak = sklenice dorazila kratší, zákazník se natáhl, nebo moc slabý hod
      weak: 'Zákazník se musel natáhnout, ale bere to!',
      // strong = přestřeleno, zákazník ucouvl
      strong: 'Trochu moc silně! Zákazník sotva uhnul, ale stačil to chytit.',
    },
    transition: '+6 piv! Zbývá poslední štace. Hurá do No Limitu!',
  },
  {
    id: 'nolimit',
    name: 'NO LIMIT',
    reward: 5,
    game: 'catch',
    icon: '🌊',
    task: 'No Limit, váš oblíbený klub. Hudba hraje, panáky létají po grupách. Ale na závěr potřebuješ pořádné pivo, nachytej plnou sklenici!',
    praises: {
      full: 'Plná až po okraj! Na tohle si připijeme',
      miss: 'Drž se proudu!',
    },
    transition: '+5 piv! A to je 23, máš to!',
  },
];

export const PALETTE = {
  gold: '#f2c14e',
  goldDark: '#c4850f',
  foam: '#fdf6e8',
  wood: '#6e4327',
  woodDark: '#4f2f1b',
  red: '#e0524a',
  green: '#5fa85a',
  blue: '#4a78c0',
  night: '#11121f',
  text: '#e8e6d0',
  gray: '#555566',
  grayLight: '#888899',
};
