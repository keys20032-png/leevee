import { Phone, ExternalLink } from "lucide-react";
import type { CrisisResource } from "@/pages/CrisisResources";

interface CrisisResourceCardProps {
  resource: CrisisResource;
}

const CrisisResourceCard = ({ resource }: CrisisResourceCardProps) => {
  const Icon = resource.icon;
  return (
    <div
      className={`group relative rounded-2xl border ${resource.borderColor} ${resource.bgColor} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${resource.color}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-semibold text-foreground mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {resource.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {resource.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {resource.phone && (
              <a
                href={`tel:${resource.phone.replace(/[^0-9]/g, "")}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/60 border border-border text-sm font-medium text-foreground hover:bg-background transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {resource.phone}
              </a>
            )}
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/60 border border-border text-sm font-medium text-foreground hover:bg-background transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisResourceCard;
