import { Player } from './player';

/**
 * Points < 40
 */
export type Love = { kind: 'LOVE' };
export type Fifteen = { kind: 'FIFTEEN' };
export type Thirty = { kind: 'THIRTY' };

/**
 * Pour les points < 40
 */
export type Point = Love | Fifteen | Thirty;

/** 
 * Constructeurs pour chaque variante de Point
 */
export const love = (): Love => ({ kind: 'LOVE' });
export const fifteen = (): Fifteen => ({ kind: 'FIFTEEN' });
export const thirty = (): Thirty => ({ kind: 'THIRTY' });

/**
 * PointsData (représente un état du match où les deux joueurs ont < 40).
 * => Ce sera utilisé pour le score "POINTS".
 */
export type PointsData = {
  playerOne: Point;
  playerTwo: Point;
};

/**
 * FortyData (représente un état du match où un joueur a 40).
 */
export type FortyData = {
  player: Player;
  otherPoint: Point;
};

/**
 * Etats du score
 */
export type Points = {
  kind: 'POINTS';
  pointsData: PointsData;
};

export type Forty = {
  kind: 'FORTY';
  fortyData: FortyData;
};

export type Deuce = {
  kind: 'DEUCE';
};

export type Advantage = {
  kind: 'ADVANTAGE';
  player: Player;
};

export type Game = {
  kind: 'GAME';
  player: Player;
};

/**
 * Constructeurs
 */
export const points = (
  p1: Point,
  p2: Point
): Points => ({
  kind: 'POINTS',
  pointsData: { playerOne: p1, playerTwo: p2 },
});

export const forty = (player: Player, otherPoint: Point): Forty => ({
  kind: 'FORTY',
  fortyData: { player, otherPoint },
});

export const deuce = (): Deuce => ({ kind: 'DEUCE' });

export const advantage = (player: Player): Advantage => ({
  kind: 'ADVANTAGE',
  player,
});

export const game = (player: Player): Game => ({
  kind: 'GAME',
  player,
});

/**
 * Type global Score = tous les états possibles
 */
export type Score = Points | Forty | Deuce | Advantage | Game;
