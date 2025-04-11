import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuggestionInput } from "@/components/ui/suggestion-input";
import { AddressSuggestionInput } from "@/components/ui/address-suggestion-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTitleSuggestions, getDescriptionSuggestions, getAddressSuggestions, countries } from "@/lib/property-suggestions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function TestFormComponentsPage() {
  const [propertyType, setPropertyType] = useState("house");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("us");
  const [address, setAddress] = useState("");
  const [activeTab, setActiveTab] = useState("title");

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Testing Form Components</h1>
      
      <Card className="max-w-3xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Form Component Tester</CardTitle>
          <CardDescription>
            Test the suggestion form components independently to verify functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select 
                value={propertyType}
                onValueChange={(value) => setPropertyType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="title">Title</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="country">Country</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
              </TabsList>
              
              <TabsContent value="title" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title</Label>
                  <SuggestionInput
                    value={title}
                    onChange={setTitle}
                    placeholder="e.g. Modern Apartment in Downtown"
                    suggestions={getTitleSuggestions(propertyType)}
                  />
                </div>
                
                <div className="p-4 rounded bg-muted">
                  <p><strong>Current value:</strong> {title}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="description" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <SuggestionInput
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe your property..."
                    suggestions={getDescriptionSuggestions(propertyType)}
                    isTextarea={true}
                    rows={5}
                  />
                </div>
                
                <div className="p-4 rounded bg-muted">
                  <p><strong>Current value:</strong> {description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="country" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={country}
                    onValueChange={setCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 rounded bg-muted">
                  <p><strong>Current value:</strong> {country}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="address" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <AddressSuggestionInput
                    value={address}
                    onChange={setAddress}
                    placeholder="Street Address"
                    suggestions={getAddressSuggestions(country)}
                  />
                </div>
                
                <div className="p-4 rounded bg-muted">
                  <p><strong>Current value:</strong> {address}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Note: This is a test page for verifying the functionality of the suggestion components.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    </div>
  );
}