
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from 'next/link';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["student", "faculty"], { required_error: "You must select a role." }),
  mobileNumber: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number." }),
  otp: z.string().min(6, { message: "OTP must be 6 digits." }),
  department: z.string().optional(),
  class: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      department: "",
      class: "",
      mobileNumber: "",
      otp: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // In a real app, you'd verify the OTP on the backend first
      const success = register(data);
      if (success) {
        toast({
          title: "Registration Successful",
          description: "You can now log in with your new account.",
        });
        router.push("/");
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An account with this email may already exist.",
        });
      }
    } catch (error) {
       toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Something went wrong. Please try again.",
        });
    } finally {
      setIsLoading(false);
    }
  };

  const role = form.watch("role");

  const handleSendOtp = () => {
    // In a real app, this would trigger an API call to send an OTP
    const mobileNumber = form.getValues("mobileNumber");
    if (!/^\d{10}$/.test(mobileNumber)) {
        form.setError("mobileNumber", { type: "manual", message: "Please enter a valid 10-digit mobile number." });
        return;
    }
    console.log(`Sending OTP to ${mobileNumber}`);
    toast({
        title: "OTP Sent",
        description: `An OTP has been sent to ${mobileNumber}. (This is a simulation)`,
    });
    setIsOtpSent(true);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
        <Image
            src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop"
            alt="MIT campus background"
            fill
            className="object-cover -z-10"
            data-ai-hint="university building"
        />
        <div className="absolute inset-0 bg-primary/80 -z-10" />
      <Card className="w-full max-w-md shadow-2xl z-10 bg-card/90 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Join MIT CSN Attendance today!</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                            <Input placeholder="e.g., 9876543210" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" onClick={handleSendOtp} disabled={isOtpSent}>
                            {isOtpSent ? "OTP Sent" : "Send OTP"}
                        </Button>
                      </div>
                      <FormMessage />
                  </FormItem>
                  )}
              />
               {isOtpSent && (
                 <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Enter OTP</FormLabel>
                        <FormControl>
                        <Input placeholder="Enter 6-digit OTP" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
               )}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === 'student' && (
                <>
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Computer Science" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., SE CSE A" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {role === 'faculty' && (
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/" className="font-medium text-primary hover:underline">
                Sign In
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
