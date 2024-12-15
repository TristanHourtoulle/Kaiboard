export type RoleProps = {
  title: string;
  color: string; // in hexa format (ex: #FFFFFF)
};

export const RoleBadge = (props: RoleProps) => {
  const { title, color } = props;

  return (
    <div
      className="inline-flex items-center justify-center px-6 py-1 rounded-full border"
      style={{
        backgroundColor: `${color}20`, // Couleur de fond avec opacité (20%)
        borderColor: color, // Bordure de la couleur choisie
        borderWidth: "2px", // Épaisseur de la bordure
      }}
    >
      <span className="text-sm" style={{ color }}>
        {title.toLowerCase()}
      </span>
    </div>
  );
};
