const generateMatchups = require('./swissMonrad');

// NOTE: Uses un-mocked matchGen.utils, ensure that passes test first //

const normArr = arr => arr.map(e => e.sort()).sort(); // normalize 2d arrays

describe('generateMatchups', () => {
  const ranking = ['a','b','c','d'];

  it('pairs without additional data', () => {
    expect(generateMatchups(ranking, { playerspermatch: 2 }))
      .toEqual([['a','b'],['c','d']]);
  });

  it('pairs with uneven playerCount', () => {
    expect(generateMatchups(ranking, { playerspermatch: 3 }))
      .toEqual([['a','b','c'],['d']]);
  });

  it('doesn\'t allow repeat byes', () => {
    expect(generateMatchups(ranking, {
      playerspermatch: 3,
      byes: ['d','c']
    })).toEqual([['a','d','c'],['b']]);
  });

  it('doesn\'t allow repeat matchups', () => {
    expect( normArr(
      generateMatchups(ranking, {
        playerspermatch: 2,
        allOpps: { a : { oppids: ['d','b'] } }
      })
    )).toEqual( normArr([['a','c'], ['b','d']]));
  });
});