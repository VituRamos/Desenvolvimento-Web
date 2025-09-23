import SimulAILogo from "../assets/SimulAI.png"
import Avatar from "../assets/Avatar.png"

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <img src={SimulAILogo} alt="Logo SimulAÍ" />
      </div>
      <div className="user-menu">
        <img src={Avatar} alt="avatar" className="avatar user" />
      </div>
    </header>
  );
}
