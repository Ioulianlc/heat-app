import { uiIcons, type UiIconName } from './uiIcons'

type UiIconProps = {
  name: UiIconName
  flip?: boolean // retourné horizontalement (ex. flèche retour → flèche suivant)
}

// Icône d'interface, décorative : le texte ou l'aria-label du bouton porte le sens
function UiIcon({ name, flip = false }: UiIconProps) {
  const icon = uiIcons[name]
  return (
    <svg
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      width={icon.width}
      height={icon.height}
      fill="currentColor"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path fillRule={icon.evenOdd ? 'evenodd' : 'nonzero'} d={icon.d} />
    </svg>
  )
}

export default UiIcon
