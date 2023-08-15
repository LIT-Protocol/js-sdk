interface LoadingProps {
  copy: string;
  error?: Error;
}

export default function Loading({ copy, error }: LoadingProps) {
  return (
    <div className="container">
      <div className="wrapper">
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        <div className="loader-container">
          <div className="loader"></div>
          <p>{copy}</p>
        </div>
      </div>
    </div>
  );
}
