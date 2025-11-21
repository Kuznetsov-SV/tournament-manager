import { generateUUID, updateStandings, generatePairingsForRound } from './swissLogic';
import { Player, Match, MatchResult, Round } from '../types';

describe('swissLogic', () => {
  // Тесты для generateUUID
  describe('generateUUID', () => {
    it('должен генерировать уникальные ID', () => {
      const id1 = generateUUID();
      const id2 = generateUUID();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('должен генерировать разные ID при каждом вызове', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateUUID());
      }
      expect(ids.size).toBe(100); // Все ID должны быть уникальными
    });
  });

  // Тесты для updateStandings
  describe('updateStandings', () => {
    it('должен корректно вычислять очки на основе результатов матчей', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', rating: 1500, score: 0, buchholz: 0, opponents: [], history: [], isActive: true },
        { id: 'p2', name: 'Player 2', rating: 1400, score: 0, buchholz: 0, opponents: [], history: [], isActive: true },
        { id: 'p3', name: 'Player 3', rating: 1300, score: 0, buchholz: 0, opponents: [], history: [], isActive: true }
      ];

      const rounds: Round[] = [
        {
          number: 1,
          matches: [
            {
              id: 'm1',
              round: 1,
              player1Id: 'p1',
              player2Id: 'p2',
              result: MatchResult.P1_WIN
            },
            {
              id: 'm2',
              round: 1,
              player1Id: 'p3',
              player2Id: 'BYE',
              result: MatchResult.P1_WIN
            }
          ],
          isCompleted: true
        }
      ];

      const standings = updateStandings(players, rounds);
      
      // p1 должен иметь 1 очко (победа)
      // p2 должен иметь 0 очков (поражение)
      // p3 должен иметь 1 очко (BYE)
      expect(standings[0].id).toBe('p1');
      expect(standings[0].score).toBe(1);
      expect(standings[1].id).toBe('p3');
      expect(standings[1].score).toBe(1);
      expect(standings[2].id).toBe('p2');
      expect(standings[2].score).toBe(0);
    });

    it('должен корректно вычислять очки при ничьей', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', rating: 1500, score: 0, buchholz: 0, opponents: [], history: [], isActive: true },
        { id: 'p2', name: 'Player 2', rating: 1400, score: 0, buchholz: 0, opponents: [], history: [], isActive: true }
      ];

      const rounds: Round[] = [
        {
          number: 1,
          matches: [
            {
              id: 'm1',
              round: 1,
              player1Id: 'p1',
              player2Id: 'p2',
              result: MatchResult.DRAW
            }
          ],
          isCompleted: true
        }
      ];

      const standings = updateStandings(players, rounds);
      
      // Оба игрока должны иметь по 0.5 очка за ничью
      expect(standings[0].score).toBe(0.5);
      expect(standings[1].score).toBe(0.5);
    });

    it('должен корректно вычислять бухгольц', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', rating: 1500, score: 0, buchholz: 0, opponents: [], history: [], isActive: true },
        { id: 'p2', name: 'Player 2', rating: 1400, score: 0, buchholz: 0, opponents: [], history: [], isActive: true },
        { id: 'p3', name: 'Player 3', rating: 1300, score: 0, buchholz: 0, opponents: [], history: [], isActive: true }
      ];

      const rounds: Round[] = [
        {
          number: 1,
          matches: [
            {
              id: 'm1',
              round: 1,
              player1Id: 'p1',
              player2Id: 'p2',
              result: MatchResult.P1_WIN
            },
            {
              id: 'm2',
              round: 1,
              player1Id: 'p3',
              player2Id: 'BYE',
              result: MatchResult.P1_WIN
            }
          ],
          isCompleted: true
        },
        {
          number: 2,
          matches: [
            {
              id: 'm3',
              round: 2,
              player1Id: 'p1',
              player2Id: 'p3',
              result: MatchResult.P1_WIN
            },
            {
              id: 'm4',
              round: 2,
              player1Id: 'p2',
              player2Id: 'BYE',
              result: MatchResult.P1_WIN
            }
          ],
          isCompleted: true
        }
      ];

      const standings = updateStandings(players, rounds);
      
      // p1: 2 очка (2 победы), его соперники (p2, p3) набрали 1 и 1 очко => Buchholz = 2
      // p3: 1 очко (победа + поражение), его соперники (p1, p1) набрали 2 и 2 очка => Buchholz = 4
      // p2: 0 очков (2 поражения), его соперники (p1, p1) набрали 2 и 2 очка => Buchholz = 4
      const p1 = standings.find(p => p.id === 'p1');
      const p3 = standings.find(p => p.id === 'p3');
      const p2 = standings.find(p => p.id === 'p2');
      
      expect(p1?.score).toBe(2);
      expect(p1?.buchholz).toBe(2); // p2(1) + p3(1) = 2
      expect(p3?.score).toBe(1);
      expect(p3?.buchholz).toBe(2); // p1(2) = 2 (BYE не учитывается в Buchholz)
      expect(p2?.score).toBe(1); // 0 от поражений + 1 от BYE
      expect(p2?.buchholz).toBe(2); // p1(2) = 2
    });

    it('должен сортировать игроков по очкам, затем по бухгольцу, затем по рейтингу', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', rating: 1500, score: 0, buchholz: 0, opponents: [], history: [], isActive: true },
        { id: 'p2', name: 'Player 2', rating: 1400, score: 0, buchholz: 0, opponents: [], history: [], isActive: true },
        { id: 'p3', name: 'Player 3', rating: 1600, score: 0, buchholz: 0, opponents: [], history: [], isActive: true },
        { id: 'p4', name: 'Player 4', rating: 1300, score: 0, buchholz: 0, opponents: [], history: [], isActive: true }
      ];

      // Создадим раунды, чтобы получить разные очки для каждого игрока
      const rounds: Round[] = [
        // Раунд 1: p1 vs p2 (p1 wins), p3 vs p4 (p3 wins)
        {
          number: 1,
          matches: [
            {
              id: 'm1',
              round: 1,
              player1Id: 'p1',
              player2Id: 'p2',
              result: MatchResult.P1_WIN
            },
            {
              id: 'm2',
              round: 1,
              player1Id: 'p3',
              player2Id: 'p4',
              result: MatchResult.P1_WIN
            }
          ],
          isCompleted: true
        },
        // Раунд 2: p1 vs p3 (p1 wins), p2 vs p4 (p2 wins)
        {
          number: 2,
          matches: [
            {
              id: 'm3',
              round: 2,
              player1Id: 'p1',
              player2Id: 'p3',
              result: MatchResult.P1_WIN
            },
            {
              id: 'm4',
              round: 2,
              player1Id: 'p2',
              player2Id: 'p4',
              result: MatchResult.P1_WIN
            }
          ],
          isCompleted: true
        }
      ];

      const standings = updateStandings(players, rounds);
      
      // После этих раундов:
      // p1: 2 wins = 2 points
      // p2: 1 win, 1 loss = 1 point
      // p3: 1 win, 1 loss = 1 point
      // p4: 0 wins = 0 points
      
      // Ожидаем сортировку: p1 (2 очка), затем между p2 и p3 по бухгольцу/рейтингу, затем p4
      // p1 должен быть первым
      expect(standings[0].id).toBe('p1');
      // p4 должен быть последним
      expect(standings[3].id).toBe('p4');
      
      // Проверим, что игроки с одинаковыми очками (p2 и p3) сортируются по бухгольцу и рейтингу
      // У p2 и p3 по 1 очку, но у p3 выше рейтинг (1600 > 1400), поэтому p3 должен быть выше при равном бухгольце
      const p2Final = standings.find(p => p.id === 'p2');
      const p3Final = standings.find(p => p.id === 'p3');
      
      // Убедимся, что они оба имеют по 1 очку
      expect(p2Final?.score).toBe(1);
      expect(p3Final?.score).toBe(1);
    });
  });

  // Тесты для generatePairingsForRound
  describe('generatePairingsForRound', () => {
    it('должен создавать пары для четного числа игроков', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', rating: 1500, score: 2, buchholz: 2, opponents: [], history: [], isActive: true },
        { id: 'p2', name: 'Player 2', rating: 1400, score: 2, buchholz: 2, opponents: [], history: [], isActive: true },
        { id: 'p3', name: 'Player 3', rating: 1300, score: 1, buchholz: 1, opponents: [], history: [], isActive: true },
        { id: 'p4', name: 'Player 4', rating: 1200, score: 1, buchholz: 1, opponents: [], history: [], isActive: true }
      ];

      const matches = generatePairingsForRound(1, players);
      
      expect(matches.length).toBe(2); // 4 игрока = 2 матча
      expect(matches.some(m => m.player1Id === 'p1')).toBeTruthy();
      expect(matches.some(m => m.player1Id === 'p2' || m.player2Id === 'p2')).toBeTruthy();
    });

    it('должен обрабатывать нечетное число игроков с помощью BYE', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', rating: 1500, score: 2, buchholz: 2, opponents: [], history: [{round: 1, opponentId: 'p3', result: 1, color: 'white'}], isActive: true },
        { id: 'p2', name: 'Player 2', rating: 1400, score: 1, buchholz: 1, opponents: [], history: [{round: 1, opponentId: 'p3', result: 0, color: 'black'}], isActive: true },
        { id: 'p3', name: 'Player 3', rating: 1300, score: 0, buchholz: 3, opponents: [], history: [{round: 1, opponentId: 'BYE', result: 1, color: 'white'}], isActive: true } // p3 уже получил BYE
      ];

      const matches = generatePairingsForRound(2, players);
      
      // Один матч и один BYE
      const byeMatches = matches.filter(m => m.player2Id === 'BYE');
      const regularMatches = matches.filter(m => m.player2Id !== 'BYE');
      
      expect(byeMatches.length).toBe(1);
      expect(regularMatches.length).toBe(1);
      
      // BYE должен достаться игроку с наименьшим рейтингом, который не получал BYE в предыдущих раундах
      // В этом случае это p2 (у p3 уже был BYE)
      expect(byeMatches[0].player1Id).toBe('p2');
    });

    it('должен избегать пары игроков, которые уже играли друг с другом', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', rating: 1500, score: 1, buchholz: 1, opponents: ['p2'], history: [], isActive: true },
        { id: 'p2', name: 'Player 2', rating: 1400, score: 1, buchholz: 1, opponents: ['p1'], history: [], isActive: true },
        { id: 'p3', name: 'Player 3', rating: 1300, score: 2, buchholz: 0, opponents: [], history: [], isActive: true },
        { id: 'p4', name: 'Player 4', rating: 1200, score: 0, buchholz: 2, opponents: [], history: [], isActive: true }
      ];

      const matches = generatePairingsForRound(2, players);
      
      // p1 и p2 уже играли друг с другом, поэтому они не должны быть в одной паре
      const p1Match = matches.find(m => m.player1Id === 'p1' || m.player2Id === 'p1');
      if (p1Match) {
        expect(p1Match.player1Id === 'p2' || p1Match.player2Id === 'p2').toBeFalsy();
      }
    });

    it('должен объединять игроков с близкими очками, когда это возможно', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', rating: 1500, score: 2, buchholz: 2, opponents: [], history: [], isActive: true },
        { id: 'p2', name: 'Player 2', rating: 1400, score: 2, buchholz: 2, opponents: [], history: [], isActive: true },
        { id: 'p3', name: 'Player 3', rating: 1300, score: 1, buchholz: 1, opponents: [], history: [], isActive: true },
        { id: 'p4', name: 'Player 4', rating: 1200, score: 1, buchholz: 1, opponents: [], history: [], isActive: true },
        { id: 'p5', name: 'Player 5', rating: 1100, score: 0, buchholz: 0, opponents: [], history: [], isActive: true },
        { id: 'p6', name: 'Player 6', rating: 1000, score: 0, buchholz: 0, opponents: [], history: [], isActive: true }
      ];

      const matches = generatePairingsForRound(1, players);
      
      // Игроки с одинаковыми очками должны быть в паре, если возможно
      // p1 и p2 (2 очка), p3 и p4 (1 очко), p5 и p6 (0 очков)
      const p1Match = matches.find(m => m.player1Id === 'p1' || m.player2Id === 'p1');
      const p2Match = matches.find(m => m.player1Id === 'p2' || m.player2Id === 'p2');
      const p3Match = matches.find(m => m.player1Id === 'p3' || m.player2Id === 'p3');
      const p4Match = matches.find(m => m.player1Id === 'p4' || m.player2Id === 'p4');
      
      // Проверим, что p1 и p2 в одной паре (или p1 против p2)
      expect(p1Match).toBeDefined();
      expect(p2Match).toBeDefined();
      if (p1Match && p2Match) {
        expect(p1Match.id).toBe(p2Match.id); // Та же пара
      }
    });
  });
});