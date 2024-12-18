export type SprintBadgeProps = {
  icon?: React.ReactNode;
  title: string;
  color: string; // in hexa format (ex: #FFFFFF)
  ctaDelete?: (team_member_id: string, team_role_id: number) => void;
  team_member_id?: string;
  team_role_id?: number;
};

export const SprintBadge = (props: SprintBadgeProps) => {
  const { title, color, ctaDelete, team_member_id, team_role_id } = props;

  return (
    <div
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full border hover:cursor-pointer group`}
      style={{
        backgroundColor: `${color}20`, // Couleur de fond avec opacité (20%)
        borderColor: color, // Bordure de la couleur choisie
        borderWidth: "2px", // Épaisseur de la bordure
      }}
      onClick={() => ctaDelete && ctaDelete(team_member_id!, team_role_id!)}
    >
      {/* If icon is set display it with mr-2 */}
      {props.icon && <span className="mr-2 opacity-50">{props.icon}</span>}
      <span className="text-xs" style={{ color }}>
        {title.toLowerCase()}
      </span>
      {ctaDelete && (
        <span className="ml-2 text-red-500/50 group-hover:text-red-500">✖</span>
      )}
    </div>
  );
};
