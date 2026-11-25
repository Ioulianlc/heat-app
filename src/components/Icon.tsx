import { iconPaths, type IconName } from './icons'

type IconProps = {
  name: IconName
  size?: number
}

// Icône décorative : elle prend la couleur du texte (currentColor)
function Icon({ name, size = 32 }: IconProps) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d={iconPaths[name]} />
    </svg>
  )
}

export default Icon
