export type LoadErrorProps = {
  error: Error;
  retry: () => void;
};

export type EmptyProps = {
  text?: string;
};

export type AvatarProps = { name: string; id?: number };
