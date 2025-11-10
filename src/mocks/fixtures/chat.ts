/**
 * Mock chat responses for different types of questions
 */

export const chatResponses = {
  // General explanation responses
  explanation: [
    `Rád ti to vysvětlím! 

**Základní principy:**

1. První důležitý bod - tento koncept je založen na základní myšlence, kterou si můžeš představit jako...
2. Druhý aspekt souvisí s praktickou aplikací
3. Třetí bod se týká pokročilých technik

**Příklad:**
\`\`\`javascript
// Ukázka kódu
const example = "Hello World";
console.log(example);
\`\`\`

**Shrnutí:**
Celkově jde o důležitý koncept, který ti pomůže lépe porozumět studovanému materiálu.`,
    
    `Výborná otázka! Pojďme si to rozebrat krok po kroku:

• **První krok**: Začneme tím, že si ujasníme základní definici
• **Druhý krok**: Podíváme se na praktické příklady
• **Třetí krok**: Probereme možné výjimky a speciální případy

💡 **Tip**: Při studiu tohoto tématu se soustřeď na propojení teorie a praxe.`,
  ],

  // Summary responses
  summary: [
    `Zde je shrnutí klíčových bodů z materiálu:

## Hlavní témata

1. **První téma** - základní informace a koncepty
2. **Druhé téma** - pokročilé techniky a aplikace
3. **Třetí téma** - praktické příklady

## Důležité pojmy

| Pojem | Význam |
|-------|--------|
| Koncept A | Vysvětlení konceptu A |
| Koncept B | Vysvětlení konceptu B |

## Závěr

Tyto informace tvoří základ pro pochopení celé problematiky.`,

    `📚 **Kompletní shrnutí materiálu:**

### Co jsme se naučili:
- Základní principy a jejich význam
- Praktické aplikace v reálném světě
- Pokročilé techniky a optimalizace

### Klíčové poznatky:
✅ První důležitý poznatek
✅ Druhý důležitý poznatek  
✅ Třetí důležitý poznatek

**Pro další studium** doporučuji zaměřit se na praktické cvičení těchto konceptů.`,
  ],

  // Quiz/test preparation
  quiz: [
    `Připravil jsem pro tebe přehled možných testových otázek:

**1. Základní otázka:**
Co je hlavním principem probíraného tématu?

*Správná odpověď:* Hlavním principem je...

**2. Aplikační otázka:**
Jak bys tento koncept použil v praxi?

*Klíčové body odpovědi:*
- První bod
- Druhý bod
- Třetí bod

**3. Analytická otázka:**
Porovnej a vysvětli rozdíly mezi...

💡 Pro přípravu na test se zaměř zejména na propojení teorie s praxí!`,
  ],

  // Concept clarification
  clarification: [
    `Pojďme si tento koncept vyjasnit:

🎯 **Definice:**
Jedná se o...

🔍 **Detailní vysvětlení:**
Tento koncept funguje tak, že...

**Praktický příklad:**
Představ si situaci, kdy...

**Časté nedorozumění:**
⚠️ Pozor na rozdíl mezi pojmem A a B - častá chyba je...

Dává to teď větší smysl?`,

    `Rád ti tento pojem objasním podrobněji:

### Co to znamená?
V základu jde o...

### Proč je to důležité?
Tento koncept je klíčový, protože...

### Jak to souvisí s ostatními tématy?
- Souvislost s tématem X
- Navazuje na téma Y
- Je základem pro téma Z

Máš ještě nějaké dotazy k tomuto tématu?`,
  ],

  // Code/programming related
  programming: [
    `Pojďme se podívat na tento kód:

\`\`\`typescript
// Základní implementace
interface Example {
  id: number;
  name: string;
}

function processData(data: Example[]): void {
  data.forEach(item => {
    console.log(\`Processing: \${item.name}\`);
  });
}
\`\`\`

**Vysvětlení:**
1. Nejdřív definujeme interface pro typovou bezpečnost
2. Funkce přijímá pole objektů typu Example
3. Iterujeme přes data a zpracováváme každý prvek

**Best practices:**
✅ Vždy používej typování
✅ Pojmenování by mělo být descriptivní
✅ Funkce by měly mít jeden jasný účel`,
  ],

  // Default/fallback response
  default: [
    `Na základě studijního materiálu ti mohu odpovědět:

Tato otázka souvisí s několika klíčovými koncepty, které jsme probrali. Dovolte mi vysvětlit:

**Hlavní body:**
1. První aspekt - základní informace
2. Druhý aspekt - praktická aplikace
3. Třetí aspekt - pokročilé koncepty

Pokud máš další dotazy nebo potřebuješ upřesnění nějakého bodu, klidně se ptej!`,

    `Rozumím tvé otázce. Podle materiálu, který máme k dispozici:

> Klíčovým bodem je pochopení základních principů a jejich praktické aplikace.

### Detail vysvětlení:
- **Co**: Popis hlavního konceptu
- **Jak**: Praktické kroky k pochopení
- **Proč**: Důležitost tématu

**Další kroky:**
1. Procvič si toto téma na příkladech
2. Propoj ho s již naučenými koncepty
3. Vyzkoušej praktické aplikace

Máš nějaké další dotazy?`,
  ],
};

/**
 * Get a random response based on message content
 */
export function getMockChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Check for keywords to determine response type
  if (lowerMessage.includes("vysvětl") || lowerMessage.includes("co je")) {
    const responses = chatResponses.explanation;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (
    lowerMessage.includes("shrň") ||
    lowerMessage.includes("shrnutí") ||
    lowerMessage.includes("přehled")
  ) {
    const responses = chatResponses.summary;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (
    lowerMessage.includes("test") ||
    lowerMessage.includes("otázk") ||
    lowerMessage.includes("zkouška")
  ) {
    const responses = chatResponses.quiz;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (
    lowerMessage.includes("rozdíl") ||
    lowerMessage.includes("porovn") ||
    lowerMessage.includes("jasně")
  ) {
    const responses = chatResponses.clarification;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (
    lowerMessage.includes("kód") ||
    lowerMessage.includes("funkce") ||
    lowerMessage.includes("implement")
  ) {
    const responses = chatResponses.programming;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Default response
  const responses = chatResponses.default;
  return responses[Math.floor(Math.random() * responses.length)];
}


