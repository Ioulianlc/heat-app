// Icônes au trait des écrans de jeu (fermer, plateau, son, timer), dessinées sur une grille de 24
const paths = {
  close: 'M6 6l12 12M18 6L6 18',
  board: 'M4 4h16v16H4zM4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16',
  sound: 'M4 9.5v5h3.5L12 18V6L7.5 9.5H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M10 2.5h4',
}

export type LineIconName = keyof typeof paths

type LineIconProps = {
  name: LineIconName
  size?: number
}

function LineIcon({ name, size = 18 }: LineIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}

export default LineIcon
