import PageHeader from '../components/PageHeader'
import Screen from '../components/Screen'

// Provisoire : remplacé par « game settings V2 » à l'étape suivante
function NewGamePage() {
  return (
    <Screen>
      <PageHeader title="New game" backTo="/" />
      <p>Game setup arrives in the next step.</p>
    </Screen>
  )
}

export default NewGamePage
