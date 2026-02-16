export interface FormulaSymbol {
  label: string
  latex: string
  category: string
}

export interface FormulaTemplate {
  label: string
  latex: string
  description: string
}

export interface FormulaCategory {
  name: string
  icon: string
  symbols: FormulaSymbol[]
}

export const formulaCategories: FormulaCategory[] = [
  {
    name: 'Common',
    icon: '∑',
    symbols: [
      { label: 'Fraction', latex: '\\frac{a}{b}', category: 'common' },
      { label: 'Square root', latex: '\\sqrt{x}', category: 'common' },
      { label: 'Nth root', latex: '\\sqrt[n]{x}', category: 'common' },
      { label: 'Exponent', latex: 'x^{n}', category: 'common' },
      { label: 'Subscript', latex: 'x_{n}', category: 'common' },
      { label: 'Summation', latex: '\\sum_{i=1}^{n}', category: 'common' },
      { label: 'Product', latex: '\\prod_{i=1}^{n}', category: 'common' },
      { label: 'Integral', latex: '\\int_{a}^{b}', category: 'common' },
      { label: 'Limit', latex: '\\lim_{x \\to \\infty}', category: 'common' },
      { label: 'Logarithm', latex: '\\log_{b}(x)', category: 'common' },
      { label: 'Natural log', latex: '\\ln(x)', category: 'common' },
      { label: 'Absolute value', latex: '|x|', category: 'common' },
    ],
  },
  {
    name: 'Greek Letters',
    icon: 'α',
    symbols: [
      { label: 'alpha', latex: '\\alpha', category: 'greek' },
      { label: 'beta', latex: '\\beta', category: 'greek' },
      { label: 'gamma', latex: '\\gamma', category: 'greek' },
      { label: 'delta', latex: '\\delta', category: 'greek' },
      { label: 'epsilon', latex: '\\epsilon', category: 'greek' },
      { label: 'zeta', latex: '\\zeta', category: 'greek' },
      { label: 'eta', latex: '\\eta', category: 'greek' },
      { label: 'theta', latex: '\\theta', category: 'greek' },
      { label: 'iota', latex: '\\iota', category: 'greek' },
      { label: 'kappa', latex: '\\kappa', category: 'greek' },
      { label: 'lambda', latex: '\\lambda', category: 'greek' },
      { label: 'mu', latex: '\\mu', category: 'greek' },
      { label: 'nu', latex: '\\nu', category: 'greek' },
      { label: 'xi', latex: '\\xi', category: 'greek' },
      { label: 'pi', latex: '\\pi', category: 'greek' },
      { label: 'rho', latex: '\\rho', category: 'greek' },
      { label: 'sigma', latex: '\\sigma', category: 'greek' },
      { label: 'tau', latex: '\\tau', category: 'greek' },
      { label: 'upsilon', latex: '\\upsilon', category: 'greek' },
      { label: 'phi', latex: '\\phi', category: 'greek' },
      { label: 'chi', latex: '\\chi', category: 'greek' },
      { label: 'psi', latex: '\\psi', category: 'greek' },
      { label: 'omega', latex: '\\omega', category: 'greek' },
      { label: 'Delta', latex: '\\Delta', category: 'greek' },
      { label: 'Theta', latex: '\\Theta', category: 'greek' },
      { label: 'Lambda', latex: '\\Lambda', category: 'greek' },
      { label: 'Pi', latex: '\\Pi', category: 'greek' },
      { label: 'Sigma', latex: '\\Sigma', category: 'greek' },
      { label: 'Omega', latex: '\\Omega', category: 'greek' },
    ],
  },
  {
    name: 'Operators',
    icon: '±',
    symbols: [
      { label: 'Plus-minus', latex: '\\pm', category: 'operators' },
      { label: 'Minus-plus', latex: '\\mp', category: 'operators' },
      { label: 'Times', latex: '\\times', category: 'operators' },
      { label: 'Divide', latex: '\\div', category: 'operators' },
      { label: 'Not equal', latex: '\\neq', category: 'operators' },
      { label: 'Less than or equal', latex: '\\leq', category: 'operators' },
      { label: 'Greater than or equal', latex: '\\geq', category: 'operators' },
      { label: 'Approximately', latex: '\\approx', category: 'operators' },
      { label: 'Proportional to', latex: '\\propto', category: 'operators' },
      { label: 'Infinity', latex: '\\infty', category: 'operators' },
      { label: 'Partial', latex: '\\partial', category: 'operators' },
      { label: 'Nabla', latex: '\\nabla', category: 'operators' },
      { label: 'Element of', latex: '\\in', category: 'operators' },
      { label: 'Not element of', latex: '\\notin', category: 'operators' },
      { label: 'Subset', latex: '\\subset', category: 'operators' },
      { label: 'Superset', latex: '\\supset', category: 'operators' },
      { label: 'Union', latex: '\\cup', category: 'operators' },
      { label: 'Intersection', latex: '\\cap', category: 'operators' },
      { label: 'For all', latex: '\\forall', category: 'operators' },
      { label: 'Exists', latex: '\\exists', category: 'operators' },
    ],
  },
  {
    name: 'Chemistry',
    icon: '⚗',
    symbols: [
      { label: 'Right arrow', latex: '\\rightarrow', category: 'chemistry' },
      { label: 'Left arrow', latex: '\\leftarrow', category: 'chemistry' },
      { label: 'Equilibrium', latex: '\\rightleftharpoons', category: 'chemistry' },
      { label: 'Degree', latex: '^{\\circ}', category: 'chemistry' },
      { label: 'Up arrow', latex: '\\uparrow', category: 'chemistry' },
      { label: 'Down arrow', latex: '\\downarrow', category: 'chemistry' },
    ],
  },
  {
    name: 'Trigonometry',
    icon: '∠',
    symbols: [
      { label: 'sin', latex: '\\sin', category: 'trig' },
      { label: 'cos', latex: '\\cos', category: 'trig' },
      { label: 'tan', latex: '\\tan', category: 'trig' },
      { label: 'cot', latex: '\\cot', category: 'trig' },
      { label: 'sec', latex: '\\sec', category: 'trig' },
      { label: 'csc', latex: '\\csc', category: 'trig' },
      { label: 'arcsin', latex: '\\arcsin', category: 'trig' },
      { label: 'arccos', latex: '\\arccos', category: 'trig' },
      { label: 'arctan', latex: '\\arctan', category: 'trig' },
      { label: 'Angle', latex: '\\angle', category: 'trig' },
      { label: 'Degrees', latex: '^{\\circ}', category: 'trig' },
    ],
  },
]

export const formulaTemplates: FormulaTemplate[] = [
  { label: 'Quadratic formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', description: 'Quadratic equation solution' },
  { label: "Einstein's equation", latex: 'E = mc^2', description: 'Mass-energy equivalence' },
  { label: 'Pythagorean theorem', latex: 'a^2 + b^2 = c^2', description: 'Right triangle relationship' },
  { label: 'Chemical equation', latex: '2H_2 + O_2 \\rightarrow 2H_2O', description: 'Water formation' },
  { label: 'Area of a circle', latex: 'A = \\pi r^2', description: 'Circle area' },
  { label: "Euler's identity", latex: 'e^{i\\pi} + 1 = 0', description: "Euler's identity" },
  { label: 'Derivative', latex: '\\frac{dy}{dx}', description: 'First derivative notation' },
  { label: 'Definite integral', latex: '\\int_{a}^{b} f(x) \\, dx', description: 'Definite integral' },
  { label: 'Binomial coefficient', latex: '\\binom{n}{k}', description: 'n choose k' },
  { label: 'Matrix 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', description: '2x2 matrix' },
]
