import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardContent } from '../../../components/ui/Card';
import { Map } from 'lucide-react';
import { motion } from 'framer-motion';

export function LearningRoadmap() {
  return (
    <Container className="py-8 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
      >
        <PageHeader 
          title="Learning Roadmap" 
          description="Your personalized path to mastering the interview." 
        />
        
        <div className="mt-8">
          <Card className="shadow-sm border-gray-100 bg-gray-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mb-6">
                <Map className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Roadmap Generation in Progress</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                We are currently building your personalized learning roadmap based on your onboarding profile and recent interview performance. Complete a mock interview to get faster recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </Container>
  );
}
