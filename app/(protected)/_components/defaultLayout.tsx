'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DefaultLayoutProps {
  listingContent: React.ReactNode;
  registerContent: React.ReactNode;
}

export function DefaultLayout({
  listingContent,
  registerContent,
}: DefaultLayoutProps) {
  return (
    <div className="bg-gradient-to-b flex flex-col overflow-x-hidden overflow-y-hidden p-6">
      <main className="w-full">
        <Tabs defaultValue="listing" className="w-full">
          <TabsList className="flex flex-wrap w-full lg:w-1/2 mx-auto">
            <TabsTrigger value="listing" className="flex-1 text-center">
              Listagem
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1 text-center">
              Cadastro
            </TabsTrigger>
          </TabsList>
          <TabsContent value="listing">
            <Card className="w-full mx-auto">{listingContent}</Card>
          </TabsContent>
          <TabsContent value="register">
            <Card className="w-full mx-auto">{registerContent}</Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
