"use client";

        
        import { useState } from "react";
        import { useRouter } from "next/navigation";

function page() {
        
        
        
       
          const [name, setName] = useState("");
          const [loading, setLoading] = useState(false);
          const router = useRouter();
        
          async function createStore() {
            setLoading(true);
        
            const res = await fetch("/api/store/create", {
              method: "POST",
              body: JSON.stringify({ name }),
            });
        
            const store = await res.json();
        
            if (store.id) {
              router.push(`/dashboard?store=${store.id}`);
            }
        
            setLoading(false);
          }
        
          return (


            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
              <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Create your store</h1>
        
                <input
                  className="input mb-4"
                  placeholder="Store name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
        
                <button
                  onClick={createStore}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? "Creating..." : "Create Store"}
                </button>
              </div>
            </div>
        
      
    
  )
}

export default page
