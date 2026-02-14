'use client'
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadTesserato from '@/components/LoadTesserato';

export default function JobRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  useEffect(() => {
    if (jobId) {
      // Buscar informações da vaga para obter o slug da empresa
      const fetchJobAndRedirect = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/jobs/${jobId}/`);
          
          if (!response.ok) {
            throw new Error('Vaga não encontrada');
          }

          const jobData = await response.json();
          
          // Buscar dados da empresa para obter o slug
          const companyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/companies/${jobData.company}/`);
          
          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            // Redirecionar para a URL correta com o slug da empresa
            router.replace(`/vagas/${companyData.slug}/${jobId}`);
          } else {
            // Se não conseguir buscar a empresa, usar um slug genérico
            router.replace(`/vagas/empresa/${jobId}`);
          }
        } catch (error) {
          console.error('Erro ao buscar vaga:', error);
          // Em caso de erro, redirecionar para a página inicial
          router.replace('/');
        }
      };

      fetchJobAndRedirect();
    }
  }, [jobId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex items-center justify-center">
      <LoadTesserato/>
    </div>
  );
}
