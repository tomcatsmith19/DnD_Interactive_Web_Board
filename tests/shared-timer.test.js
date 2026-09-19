const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const { formatTimerSeconds, remainingTimerSeconds } = require('../public/shared-timer');

test('shared timer formats minute and hour countdowns', () => {
  assert.equal(formatTimerSeconds(0), '00:00');
  assert.equal(formatTimerSeconds(65), '01:05');
  assert.equal(formatTimerSeconds(3661), '1:01:01');
});

test('shared timer derives a live countdown and preserves paused time', () => {
  assert.equal(remainingTimerSeconds({ status: 'running', endsAtMs: 112500 }, 100000), 13);
  assert.equal(remainingTimerSeconds({ status: 'running', endsAtMs: 99999 }, 100000), 0);
  assert.equal(remainingTimerSeconds({ status: 'paused', remainingSeconds: 42 }, 100000), 42);
});

test('DM controls the shared timer while player pages are display-only', () => {
  const source = fs.readFileSync('public/shared-timer.js', 'utf8');
  const dm = fs.readFileSync('public/dm.html', 'utf8');
  const player = fs.readFileSync('public/player.html', 'utf8');
  assert.match(dm, /shared-timer\.js\?v=4/);
  assert.match(player, /shared-timer\.js\?v=4/);
  assert.match(dm, /setupSharedCountdownTimer\(\{ db, firebase, isDm: true \}\)/);
  assert.match(player, /setupSharedCountdownTimer\(\{ db, firebase, isDm: false \}\)/);
  assert.match(source, /db\.collection\("shared"\)\.doc\(TIMER_DOCUMENT\)/);
  assert.match(source, /if \(isDm\) \{/);
  assert.match(source, /data-timer-action="start"/);
  assert.match(source, /<details class="shared-countdown-menu"><summary>Set Timer<\/summary>/);
  assert.match(source, /\.shared-countdown\.is-dm\{width:190px;\}/);
  assert.match(source, /class="shared-countdown-hourglass"/);
  assert.match(source, /font-family:'MedievalSharp'/);
  assert.match(source, /function positionBesideMapTools/);
  assert.match(source, /bounds\.right \+ 10/);
});
