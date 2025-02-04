import { describe, expect, test } from '@jest/globals';
import * as fc from 'fast-check';
import * as G from './generators';

import { Player,isSamePlayer } from '../types/player';
import {
  advantage,
  deuce,
  forty,
  game,
  thirty,
} from '../types/score';

import {
  otherPlayer,
  playerToString,
  scoreWhenDeuce,
  scoreWhenAdvantage,
  scoreWhenForty,
  scoreWhenPoint,
} from '..';

describe('Tests for tooling functions', () => {
  test('Given playerOne when playerToString', () => {
    expect(playerToString('PLAYER_ONE')).toStrictEqual('Player 1');
  });
  test('Given playerOne when otherPlayer', () => {
    expect(otherPlayer('PLAYER_ONE')).toStrictEqual('PLAYER_TWO');
  });
});

describe('Tests for transition functions', () => {
  test('Given deuce, score is advantage to winner', () => {
    fc.assert(
      fc.property(G.getPlayer(), winner => {
        const score = scoreWhenDeuce(winner);
        const expected = advantage(winner);
        expect(score).toStrictEqual(expected);
      })
    );
  });

  test('Given advantage when advantagedPlayer wins, score is Game(advantagedPlayer)', () => {
    fc.assert(
      fc.property(G.getPlayer(), G.getPlayer(), (advantagedPlayer: Player, winner: Player) => {
        (fc.pre as any)(isSamePlayer(advantagedPlayer, winner));

        const score = scoreWhenAdvantage(advantagedPlayer, winner);
        const expected = game(winner);
        expect(score).toStrictEqual(expected);
      })
    );
  });

  test('Given advantage when otherPlayer wins, score is Deuce', () => {
    fc.assert(
      fc.property(G.getPlayer(), G.getPlayer(), (advantagedPlayer, winner) => {
        (fc.pre as any)(!isSamePlayer(advantagedPlayer, winner));

        const score = scoreWhenAdvantage(advantagedPlayer, winner);
        const expected = deuce();
        expect(score).toStrictEqual(expected);
      })
    );
  });

  test('Given a player at 40 when the same player wins, score is Game for this player', () => {
    fc.assert(
      fc.property(G.getForty(), G.getPlayer(), ({ fortyData }, winner) => {
        (fc.pre as any)(isSamePlayer(fortyData.player, winner));

        const newScore = scoreWhenForty(fortyData, winner);
        const expected = game(winner);
        expect(newScore).toStrictEqual(expected);
      })
    );
  });

  test('Given player at 40 and other at 30 when other wins, score is Deuce', () => {
    fc.assert(
      fc.property(G.getForty(), G.getPlayer(), ({ fortyData }, winner) => {
        (fc.pre as any)(!isSamePlayer(fortyData.player, winner));
        (fc.pre as any)(fortyData.otherPoint.kind === 'THIRTY');

        const newScore = scoreWhenForty(fortyData, winner);
        const expected = deuce();
        expect(newScore).toStrictEqual(expected);
      })
    );
  });

  test('Given player at 40 and other at 15 when other wins, score is 40 - 15', () => {
    fc.assert(
      fc.property(G.getForty(), G.getPlayer(), ({ fortyData }, winner) => {
        (fc.pre as any)(!isSamePlayer(fortyData.player, winner));
        (fc.pre as any)(fortyData.otherPoint.kind === 'FIFTEEN');

        const newScore = scoreWhenForty(fortyData, winner);
        const expected = forty(fortyData.player, thirty());
        expect(newScore).toStrictEqual(expected);
      })
    );
  });

  test('Given players at 0 or 15 points => score kind is still POINTS', () => {
    fc.assert(
      fc.property(G.getPoints(), G.getPlayer(), ({ pointsData }, winner) => {
        const { playerOne, playerTwo } = pointsData;
        (fc.pre as any)(playerOne.kind !== 'THIRTY' && playerTwo.kind !== 'THIRTY');

        const newScore = scoreWhenPoint(pointsData, winner);
        expect(newScore.kind).toBe('POINTS');
      })
    );
  });

  test('Given one player at 30 and that player wins => score is FORTY', () => {
    fc.assert(
      fc.property(G.getPoints(), G.getPlayer(), ({ pointsData }, winner) => {
        const { playerOne, playerTwo } = pointsData;

        const p1Is30 = playerOne.kind === 'THIRTY';
        const p2Is30 = playerTwo.kind === 'THIRTY';

        (fc.pre as any)(
          p1Is30 !== p2Is30 &&
            ((p1Is30 && winner === 'PLAYER_ONE') ||
              (p2Is30 && winner === 'PLAYER_TWO'))
        );

        const newScore = scoreWhenPoint(pointsData, winner);
        expect(newScore.kind).toBe('FORTY');
      })
    );
  });
});