import './Loading.css';

export const Loading = ({
  fullScreen = false,
  size = 'medium',
  message = 'Carregando...',
}) => {
  const sizeClass = `loading-${size}`;

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div
          className={`loading-spinner ${sizeClass}`}
        ></div>
        {message && (
          <p className="loading-message">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClass}`}></div>
      {message && (
        <p className="loading-message">{message}</p>
      )}
    </div>
  );
};

export const Skeleton = ({
  width = '100%',
  height = '20px',
  className = '',
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    ></div>
  );
};
