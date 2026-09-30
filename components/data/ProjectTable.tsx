import Link from "next/link";
import type { Project } from "@/lib/data/projects";
import { EmptyNote, usd } from "./parts";

const dateFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

export function ProjectTable({ projects, showCountry = true }: { projects: Project[]; showCountry?: boolean }) {
  if (projects.length === 0) {
    return <EmptyNote>No World Bank pipeline or recent approvals returned for this view.</EmptyNote>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Project</th>
            {showCountry ? <th>Country</th> : null}
            <th>Theme</th>
            <th>Status</th>
            <th>Board date</th>
            <th className="text-right">Commitment</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="max-w-md">
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-forest">
                  {project.name}
                </a>
                <span className="ml-2 font-mono text-[10px] text-muted">{project.id}</span>
              </td>
              {showCountry ? (
                <td>
                  <Link href={`/countries/${project.country.slug}`} className="hover:text-forest">
                    {project.country.name}
                  </Link>
                </td>
              ) : null}
              <td className="text-xs text-ink-soft">{project.theme}</td>
              <td className="font-mono text-[11px]">
                <span className={project.status === "Pipeline" ? "text-gold" : "text-ink-soft"}>{project.status}</span>
              </td>
              <td className="font-mono text-[11px]">{project.approvalDate ? dateFmt.format(new Date(project.approvalDate)) : "—"}</td>
              <td className="text-right font-mono text-xs">{project.amountUsd > 0 ? usd(project.amountUsd) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
