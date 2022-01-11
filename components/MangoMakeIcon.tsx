const MangoMakeIcon = ({
  color = '#E1CE7A',
  className,
}: {
  color?: string
  className?: string
}) => {
  return (
    <svg
      className={className}
      width="36"
      height="37"
      viewBox="0 0 36 37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.0005 12.2344C25.4563 12.2344 31.5005 10.2197 31.5005 7.73438C31.5005 5.24909 25.4563 3.23438 18.0005 3.23438C10.5446 3.23438 4.50049 5.24909 4.50049 7.73438C4.50049 10.2197 10.5446 12.2344 18.0005 12.2344Z"
        stroke={color}
        strokeWidth="3.00312"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31.5005 18.2344C31.5005 20.7244 25.5005 22.7344 18.0005 22.7344C10.5005 22.7344 4.50049 20.7244 4.50049 18.2344"
        stroke={color}
        strokeWidth="3.00312"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.50049 7.73438V28.7344C4.50049 31.2244 10.5005 33.2344 18.0005 33.2344C25.5005 33.2344 31.5005 31.2244 31.5005 28.7344V7.73438"
        stroke={color}
        strokeWidth="3.00312"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default MangoMakeIcon
