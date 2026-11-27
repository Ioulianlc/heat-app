import PageHeader from '../components/PageHeader'
import Screen from '../components/Screen'
import { trapCard } from '../game/trapCards'
import type { Trap } from '../game/types'
import styles from './HowToPlayPage.module.css'

const TRAPS: Trap[] = ['double', 'substitution', 'forced']

type OutcomesProps = {
  wrong: { title: string; text: string }
  right: { title: string; text: string }
}

// Les deux cases de la maquette V5 : rouge « Wrong answer », vert « Right answer »
function Outcomes({ wrong, right }: OutcomesProps) {
  return (
    <div className={styles.outcomes}>
      <div className={`${styles.outcome} ${styles.wrong}`}>
        <h3 className={styles.outcomeTitle}>{wrong.title}</h3>
        <p>{wrong.text}</p>
      </div>
      <div className={`${styles.outcome} ${styles.right}`}>
        <h3 className={styles.outcomeTitle}>{right.title}</h3>
        <p>{right.text}</p>
      </div>
    </div>
  )
}

// Les règles du PDF « Heat – Rules of the Game », dans le style de la maquette V5 :
// étapes numérotées, cases rouge et verte, cartes pièges en miniature
function HowToPlayPage() {
  return (
    <Screen>
      <PageHeader title="How to play" backTo="/profile" />

      <section className={styles.section} aria-labelledby="turn">
        <h2 id="turn" className={styles.title}>
          How to play a turn
        </h2>
        <ol className={styles.steps}>
          <li>The asker draws the top card and announces only its topic.</li>
          <li>
            The answerer bets 1 to 4 chillies on that topic. More chillies: a bigger move, and a
            hotter sauce.
          </li>
          <li>The asker flips the card and reads the question and its 4 answers.</li>
          <li>The answerer picks one answer before the timer runs out. No phone, no help.</li>
          <li>The answerer becomes the asker, and the player on their left answers.</li>
        </ol>
        <Outcomes
          wrong={{
            title: 'Wrong answer',
            text: 'Stay put and take the sauce matching your bet. Time’s up counts as wrong.',
          }}
          right={{ title: 'Right answer', text: 'Move forward 1 space per chilli bet.' }}
        />
      </section>

      <section className={styles.section} aria-labelledby="traps">
        <h2 id="traps" className={styles.title}>
          Trap cards
        </h2>
        <p>
          About 1 card in 10 is a trap. It shows up when the card is drawn, before the bet. The
          question then comes from the next card.
        </p>
        <ul className={styles.cards}>
          {TRAPS.map((trap) => {
            const { title, text } = trapCard(trap)
            return (
              <li key={trap} className={styles.card}>
                <h3 className={styles.cardTitle}>{title}</h3>
                <p className={styles.cardText}>{text}</p>
              </li>
            )
          })}
        </ul>
        <ul className={styles.notes}>
          <li>
            <strong>X2.</strong> Right: move as usual. Wrong: take the sauce twice.
          </li>
          <li>
            <strong>Substitution.</strong> Right: you move. Wrong: the player on your right takes
            the sauce.
          </li>
          <li>
            <strong>Forced.</strong> The player on your left chooses your bet.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="final">
        <h2 id="final" className={styles.title}>
          The final challenge
        </h2>
        <p>The aim: be the first to reach the end of the board, and survive what waits there.</p>
        <ol className={styles.steps}>
          <li>Reach or pass the last space: the final challenge begins.</li>
          <li>Take one dose of the hottest sauce, or decline it and move back 4 spaces.</li>
          <li>The asker draws 5 cards and reads the 5 questions in a row.</li>
          <li>Answer all 5, in order, from memory.</li>
        </ol>
        <Outcomes
          wrong={{ title: 'Even one wrong', text: 'Try again on your next turn.' }}
          right={{ title: '5 out of 5', text: 'You win the game!' }}
        />
      </section>

      <section className={styles.section} aria-labelledby="good">
        <h2 id="good" className={styles.title}>
          Good to know
        </h2>
        <ul className={styles.notes}>
          <li>
            <strong>Decline a sauce.</strong> Move back 1 space per chilli bet instead, twice as
            many on an X2.
          </li>
          <li>
            <strong>Very Hot cards.</strong> 8 black cards, harder than the others, hide in the
            pile.
          </li>
          <li>
            <strong>Tie.</strong> The player with fewer sauces is ahead.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="safe">
        <h2 id="safe" className={styles.title}>
          Play it safe
        </h2>
        <div className={styles.warning}>
          <h3 className={styles.outcomeTitle}>Extremely hot sauces. Adults only (18+)</h3>
          <p>
            This game makes players eat very spicy sauces. They can cause intense burning in the
            mouth, throat and stomach, as well as tears, sweating, nausea or vomiting.
          </p>
          <p>
            Do not play if you are pregnant or breastfeeding, have heart problems, high blood
            pressure, asthma, stomach or digestive problems, or a food allergy. Players take part at
            their own risk. In case of a severe reaction, stop immediately and call emergency
            services.
          </p>
        </div>
        <ul className={styles.notes}>
          <li>Check everyone’s allergies and food intolerances before choosing the sauces.</li>
          <li>Serve small amounts: half a teaspoon is enough.</li>
          <li>Keep milk, yogurt or bread nearby. Water does not cool the burn.</li>
          <li>Wash your hands after touching the sauces and never touch your eyes.</li>
        </ul>
      </section>
    </Screen>
  )
}

export default HowToPlayPage
