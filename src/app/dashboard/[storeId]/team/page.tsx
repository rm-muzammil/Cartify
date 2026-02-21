"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function TeamPage() {
  const { storeId } = useParams();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/team?storeId=${storeId}`)
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
        setLoading(false);
      });
  }, [storeId]);

  if (loading) return <p>Loading team members...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team Members</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
  {members && members.length > 0 ? (
    members.map((member: any) => (
      <div key={member.id} className="flex justify-between p-2 bg-white rounded shadow">
        <span>{member.user?.name ?? "Unknown User"}</span>
        <span className="text-gray-500">{member.role}</span>
      </div>
    ))
  ) : (
    <p>No team members found.</p>
  )}
</div>

      </div>
    </div>
  );
}
