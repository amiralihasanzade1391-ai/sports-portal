import { CommentList } from "@/components/dashboard/comment-list";
import { PageHeader } from "@/components/shared/page-header";

export default function DashboardCommentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Comments & Discussions"
        description="Track all feedback, replies, and community contributions you've made across article coverage."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Comments" },
        ]}
      />

      <CommentList />
    </div>
  );
}
