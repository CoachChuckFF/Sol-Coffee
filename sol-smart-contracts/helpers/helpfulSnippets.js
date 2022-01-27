// Helpers
const LAMPORT_COST = 0.000000001
const numToRust = (num) => 
{
  return new BN(Math.round(num));
}

const solTolamports = (sol) => {
  return Math.round(sol / LAMPORT_COST);
}

const lamportsToSol = (lamports) => {
  return Math.round(lamports * LAMPORT_COST);
}