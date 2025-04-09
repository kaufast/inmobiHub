import React from 'react';
import PropertyComparisonDashboard from '@/components/comparison/property-comparison-dashboard';
import MetaTags from '@/components/seo/meta-tags';
import { usePropertyComparison } from '@/hooks/use-property-comparison';

export default function PropertyComparisonPage() {
  const { compareIds } = usePropertyComparison();
  
  // Set the page title based on number of properties
  const pageTitle = compareIds.length 
    ? `Comparing ${compareIds.length} Properties - PropertyHub` 
    : "Property Comparison - PropertyHub";
  
  return (
    <>
      <MetaTags
        title={pageTitle}
        description="Compare multiple properties side by side to make an informed decision"
        canonical="/property-comparison"
      />
      <div className="container mx-auto py-10">
        <PropertyComparisonDashboard />
      </div>
    </>
  );
}