import PageHeader from '../components/PageHeader'
import Screen from '../components/Screen'
import styles from './HowToPlayPage.module.css'

// Les règles du PDF « Heat – Rules of the Game », version app
function HowToPlayPage() {
  return (
    <Screen>
      <PageHeader title="How to play" backTo="/profile" />

      <section className={`${styles.block} ${styles.warning}`} aria-labelledby="warning">
        <h2 id="warning">Extremely hot sauces. Adults only (18+)</h2>
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
      </section>

      <section className={styles.block} aria-labelledby="aim">
        <h2 id="aim">The aim</h2>
        <p>
          Be the first player to reach the finish line of the board… and survive the final
          challenge waiting for you there. 4 to 6 players, 30 to 45 minutes.
        </p>
      </section>

      <section className={styles.block} aria-labelledby="turn">
        <h2 id="turn">A turn</h2>
        <p>Each turn has an asker, who holds the phone, and an answerer, who plays.</p>
        <ol className={styles.steps}>
          <li>
            <strong>Draw.</strong> The asker reveals only the topic of the card.
          </li>
          <li>
            <strong>Bet.</strong> The answerer bets 1 to 4 chillies on that topic.
          </li>
          <li>
            <strong>Ask.</strong> The asker reads the question. If it is a trap card, its effect
            comes first.
          </li>
          <li>
            <strong>Answer.</strong> One answer. No phone, no help from the others.
          </li>
          <li>
            <strong>Right:</strong> move forward as many spaces as chillies bet.
          </li>
          <li>
            <strong>Wrong:</strong> stay put and take the sauce matching your bet (4 chillies = the
            hottest).
          </li>
          <li>
            <strong>Next turn.</strong> The answerer becomes the asker, and the next player
            answers.
          </li>
        </ol>
      </section>

      <section className={styles.block} aria-labelledby="traps">
        <h2 id="traps">Trap cards</h2>
        <p>They look like any other card and are revealed only after the bet.</p>
        <dl className={styles.traps}>
          <dt>Substitution</dt>
          <dd>The player on the answerer's right answers instead. Wrong? They take the sauce.</dd>
          <dt>Double or Nothing</dt>
          <dd>A new question is drawn. Right: move as usual. Wrong: take the sauce twice.</dd>
          <dt>Forced Bet</dt>
          <dd>The asker chooses the number of chillies, replacing the bet already made.</dd>
        </dl>
      </section>

      <section className={styles.block} aria-labelledby="end">
        <h2 id="end">The final challenge</h2>
        <p>
          The first player to reach or pass the finish line takes one dose of the hottest sauce.
          The others read 5 questions in a row, then the player answers all 5 in order.
        </p>
        <p>
          All 5 right? You win! Even one wrong? Stay on the finish line and try again on your next
          turn. If two players are tied, the one with fewer sauces is ahead.
        </p>
      </section>

      <section className={styles.block} aria-labelledby="safe">
        <h2 id="safe">Play it safe</h2>
        <ul className={styles.steps}>
          <li>Check everyone's allergies and food intolerances before choosing the sauces.</li>
          <li>Serve small amounts: half a teaspoon is enough.</li>
          <li>Keep milk, yogurt or bread nearby. Water does not cool the burn.</li>
          <li>Wash your hands after touching the sauces and never touch your eyes.</li>
          <li>Anyone can decline a sauce: move back 1 space per chilli bet instead.</li>
        </ul>
      </section>
    </Screen>
  )
}

export default HowToPlayPage
