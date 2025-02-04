import { Player, isSamePlayer } from './types/player';
import {
  Point,
  PointsData,
  FortyData,
  Score,
  love,
  fifteen,
  thirty,
  points,
  forty,
  deuce,
  advantage,
  game,
} from './types/score';

export const playerToString = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'Player 1';
    case 'PLAYER_TWO':
      return 'Player 2';
  }
};
export const otherPlayer = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'PLAYER_TWO';
    case 'PLAYER_TWO':
      return 'PLAYER_ONE';
  }
};

/** Affichage textuel d'un point < 40 */
export const pointToString = (point: Point): string => {
  switch (point.kind) {
    case 'LOVE':
      return '0';
    case 'FIFTEEN':
      return '15';
    case 'THIRTY':
      return '30';
  }
};

/** Affichage global d'un Score (Points, Forty, Deuce, Advantage, Game) */
export const scoreToString = (score: Score): string => {
  switch (score.kind) {
    case 'POINTS': {
      const p1 = pointToString(score.pointsData.playerOne);
      const p2 = pointToString(score.pointsData.playerTwo);
      return `${p1} - ${p2}`;
    }
    case 'FORTY': {
      const { player, otherPoint } = score.fortyData;
      if (player === 'PLAYER_ONE') {
        return `40 - ${pointToString(otherPoint)}`;
      } else {
        return `${pointToString(otherPoint)} - 40`;
      }
    }
    case 'DEUCE':
      return 'Deuce';
    case 'ADVANTAGE':
      return `Advantage ${score.player}`;
    case 'GAME':
      return `Game ${score.player}`;
  }
};

/**
 * Tooling pour incrémenter un point
 */
export const incrementPoint = (point: Point): Point | null => {
  switch (point.kind) {
    case 'LOVE':
      return fifteen();
    case 'FIFTEEN':
      return thirty();
    case 'THIRTY':
      // Impossible d'aller à 40 avec ce type : on retourne null pour signaler
      // qu'il faut éventuellement passer à un état FORTY.
      return null;
  }
};

/**
 * Fonctions de transition (scoreWhenDeuce, scoreWhenAdvantage, etc.)
 */
export const scoreWhenDeuce = (winner: Player): Score => {
  return advantage(winner);
};

export const scoreWhenAdvantage = (advantagedPlayer: Player, winner: Player): Score => {
  if (isSamePlayer(advantagedPlayer, winner)) {
    return game(winner);
  }
  return deuce();
};

export const scoreWhenForty = (fortyData: FortyData, winner: Player): Score => {
  // Cas 1 - le joueur à 40 gagne
  if (isSamePlayer(fortyData.player, winner)) {
    return game(winner);
  }

  // Cas 2 - l'autre joueur marque
  // => s'il avait 30 => Deuce
  if (fortyData.otherPoint.kind === 'THIRTY') {
    return deuce();
  }

  // => sinon, on l'incrémente
  const newPoint = incrementPoint(fortyData.otherPoint);
  if (newPoint == null) {
    // normalment jamais null ici mais on sécurise
    return deuce();
  }

  return forty(fortyData.player, newPoint);
};

export const scoreWhenGame = (winnerInitial: Player): Score => {
  return game(winnerInitial);
};

/**
 * Règles:
 *   - On incrémente le joueur qui gagne
 *   - Si on passe de 30 à 40, alors on change d'état vers Forty
 *   - Sinon on reste dans Points
 */
export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  const { playerOne, playerTwo } = current;

  if (winner === 'PLAYER_ONE') {
    // Tente d'incrémdenter p1
    const inc = incrementPoint(playerOne);
    if (inc === null) {
      // Ça veut dire qu'il était à 30 donc on passe à Forty
      return forty('PLAYER_ONE', playerTwo);
    }
    return points(inc, playerTwo);
  } else {
    // Tente d'incrémenter p2
    const inc = incrementPoint(playerTwo);
    if (inc === null) {
      return forty('PLAYER_TWO', playerOne);
    }
    return points(playerOne, inc);
  }
};

/**
 * Fonction de transition: score(Score, Player) => Score
 */
   
export const score = (currentScore: Score, winner: Player): Score => {
  switch (currentScore.kind) {
    case 'POINTS':
      return scoreWhenPoint(currentScore.pointsData, winner);

    case 'FORTY':
      return scoreWhenForty(currentScore.fortyData, winner);

    case 'DEUCE':
      return scoreWhenDeuce(winner);

    case 'ADVANTAGE':
      return scoreWhenAdvantage(currentScore.player, winner);

    case 'GAME':
      return scoreWhenGame(currentScore.player);
  }
};

/**
 * Initialiser une nouvelle partie
 */
export const newGame: Score = points(love(), love());
