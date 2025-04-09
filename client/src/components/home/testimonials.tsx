import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  quote: string;
  author: {
    name: string;
    title: string;
    image: string;
  };
  rating: number;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      quote: "Foundation has completely transformed how I approach real estate investing. The data insights helped me find properties with 20% higher ROI than my previous investments.",
      author: {
        name: "Robert Chen",
        title: "Real Estate Investor, San Francisco",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      rating: 5,
    },
    {
      quote: "The neighborhood insights and trend forecasting are invaluable. I've expanded my portfolio in emerging areas and have seen consistent double-digit appreciation.",
      author: {
        name: "Samantha Williams",
        title: "Property Developer, Chicago",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      rating: 5,
    },
    {
      quote: "As a first-time investor, Foundation gave me the confidence to make smart decisions. The ROI calculator and market trends analysis made everything clear and actionable.",
      author: {
        name: "Marcus Johnson",
        title: "New Investor, Austin",
        image: "https://randomuser.me/api/portraits/men/75.jpg",
      },
      rating: 4.5,
    },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400 mb-1">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < Math.floor(rating) ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : rating - i > 0 && rating - i < 1 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fillOpacity="0.5" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" fillOpacity="0.3">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4 text-center">What Our Clients Say</h2>
        <p className="text-primary-600 text-center mb-12 max-w-2xl mx-auto">
          Hear from investors who have transformed their real estate strategy with our data-driven platform.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-primary-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                <blockquote className="text-primary-700 mb-6">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.author.image} alt={testimonial.author.name} />
                    <AvatarFallback className="bg-primary-200 text-primary-700">
                      {testimonial.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-primary-800">{testimonial.author.name}</h4>
                    <p className="text-sm text-primary-500">{testimonial.author.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
