import type { InfoStripConfig } from "../../types/infoStrip";

type InfoStripProps = {
  info: InfoStripConfig;
};

function InfoStrip({ info }: InfoStripProps) {
  const { items, link } = info;

  return (
    <div className="infostrip">
      <div className="infostrip-items">
        {items.map((item, index) => (
          <div key={index} className="infostrip-item-group">
            <span className="infostrip-item">{item}</span>
            {index < items.length - 1 && <span className="infostrip-divider" />}
          </div>
        ))}
      </div>

      {link && (
        <a
          href={link.href}
          title={link.title}
          target="_blank"
          rel="noreferrer"
          className="infostrip-link pointer"
        >
          {link.title}
        </a>
      )}
    </div>
  );
}

export default InfoStrip;
