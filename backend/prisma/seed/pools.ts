// Curated data pools for deterministic, non-repetitive Indian matchmaking profiles.

export interface CityInfo {
  city: string;
  motherTongues: string[];
}

export const CITIES: CityInfo[] = [
  { city: 'Mumbai', motherTongues: ['Marathi', 'Hindi', 'Gujarati'] },
  { city: 'Pune', motherTongues: ['Marathi', 'Hindi'] },
  { city: 'Delhi', motherTongues: ['Hindi', 'Punjabi'] },
  { city: 'Gurgaon', motherTongues: ['Hindi', 'Punjabi'] },
  { city: 'Noida', motherTongues: ['Hindi'] },
  { city: 'Bangalore', motherTongues: ['Kannada', 'Tamil', 'Telugu', 'Hindi'] },
  { city: 'Hyderabad', motherTongues: ['Telugu', 'Urdu', 'Hindi'] },
  { city: 'Chennai', motherTongues: ['Tamil'] },
  { city: 'Coimbatore', motherTongues: ['Tamil'] },
  { city: 'Kolkata', motherTongues: ['Bengali', 'Hindi'] },
  { city: 'Ahmedabad', motherTongues: ['Gujarati', 'Hindi'] },
  { city: 'Surat', motherTongues: ['Gujarati'] },
  { city: 'Jaipur', motherTongues: ['Hindi', 'Rajasthani'] },
  { city: 'Udaipur', motherTongues: ['Hindi', 'Rajasthani'] },
  { city: 'Chandigarh', motherTongues: ['Punjabi', 'Hindi'] },
  { city: 'Amritsar', motherTongues: ['Punjabi'] },
  { city: 'Indore', motherTongues: ['Hindi'] },
  { city: 'Bhopal', motherTongues: ['Hindi'] },
  { city: 'Kochi', motherTongues: ['Malayalam'] },
  { city: 'Thiruvananthapuram', motherTongues: ['Malayalam'] },
  { city: 'Lucknow', motherTongues: ['Hindi', 'Urdu'] },
  { city: 'Nagpur', motherTongues: ['Marathi', 'Hindi'] },
  { city: 'Bhubaneswar', motherTongues: ['Odia', 'Hindi'] },
  { city: 'Dehradun', motherTongues: ['Hindi'] },
];

export interface ReligionInfo {
  religion: string;
  castes: string[];
}

export const RELIGIONS: ReligionInfo[] = [
  { religion: 'Hindu', castes: ['Brahmin', 'Kshatriya', 'Agarwal', 'Maratha', 'Reddy', 'Nair', 'Iyer', 'Kayastha', 'Rajput', 'Yadav'] },
  { religion: 'Muslim', castes: ['Sunni', 'Shia'] },
  { religion: 'Christian', castes: ['Roman Catholic', 'Protestant', 'Syrian Christian'] },
  { religion: 'Sikh', castes: ['Jat', 'Khatri', 'Ramgarhia'] },
  { religion: 'Jain', castes: ['Digambar', 'Shvetambar'] },
  { religion: 'Buddhist', castes: ['Navayana'] },
];

export const MALE_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Krishna', 'Ishaan',
  'Kabir', 'Rohan', 'Dhruv', 'Karan', 'Aryan', 'Rahul', 'Siddharth', 'Nikhil',
  'Aman', 'Varun', 'Rishabh', 'Harsh', 'Ankit', 'Pranav', 'Yash', 'Tushar',
  'Manish', 'Saurabh', 'Akash', 'Gaurav', 'Abhishek', 'Naveen', 'Sandeep', 'Deepak',
  'Imran', 'Faisal', 'Joseph', 'Daniel', 'Gurpreet', 'Harman', 'Tarun', 'Vikram',
];

export const FEMALE_NAMES = [
  'Aanya', 'Diya', 'Saanvi', 'Aadhya', 'Ananya', 'Pari', 'Anika', 'Navya',
  'Riya', 'Ishita', 'Kavya', 'Meera', 'Sneha', 'Priya', 'Pooja', 'Neha',
  'Shruti', 'Tanvi', 'Aditi', 'Sakshi', 'Nidhi', 'Divya', 'Megha', 'Swati',
  'Ritika', 'Kritika', 'Isha', 'Sara', 'Ayesha', 'Fatima', 'Mary', 'Grace',
  'Simran', 'Harleen', 'Lakshmi', 'Deepika', 'Anjali', 'Shreya', 'Nandini', 'Trisha',
];

export const SURNAMES = [
  'Sharma', 'Verma', 'Gupta', 'Mehra', 'Kapoor', 'Malhotra', 'Agarwal', 'Bansal',
  'Patel', 'Shah', 'Desai', 'Joshi', 'Iyer', 'Nair', 'Menon', 'Reddy',
  'Rao', 'Naidu', 'Mukherjee', 'Banerjee', 'Chatterjee', 'Das', 'Bose', 'Khan',
  'Sheikh', 'Ahmed', 'Fernandes', "D'Souza", 'Thomas', 'Singh', 'Gill', 'Sandhu',
];

export const COLLEGES = [
  { name: 'IIT Bombay', tier: 'top' },
  { name: 'IIT Delhi', tier: 'top' },
  { name: 'IIT Madras', tier: 'top' },
  { name: 'BITS Pilani', tier: 'top' },
  { name: 'IIM Ahmedabad', tier: 'top' },
  { name: 'NIT Trichy', tier: 'high' },
  { name: 'Delhi University', tier: 'high' },
  { name: 'VIT Vellore', tier: 'high' },
  { name: 'SRCC', tier: 'high' },
  { name: 'Manipal Institute of Technology', tier: 'mid' },
  { name: 'Symbiosis Pune', tier: 'mid' },
  { name: 'Christ University', tier: 'mid' },
  { name: 'Amity University', tier: 'mid' },
  { name: 'Pune University', tier: 'mid' },
  { name: 'Mumbai University', tier: 'mid' },
];

export const DEGREES = [
  'B.Tech Computer Science',
  'B.Tech Mechanical',
  'B.E. Electronics',
  'MBBS',
  'B.Com',
  'BBA',
  'B.A. Economics',
  'B.Sc Mathematics',
  'M.Tech',
  'MBA',
  'M.S. Computer Science',
  'CA',
  'M.A. Psychology',
  'PhD Data Science',
  'B.Arch',
];

export const COMPANIES = [
  { name: 'Google', band: 5 },
  { name: 'Microsoft', band: 5 },
  { name: 'Amazon', band: 4 },
  { name: 'Goldman Sachs', band: 5 },
  { name: 'McKinsey & Co.', band: 5 },
  { name: 'Flipkart', band: 4 },
  { name: 'Tata Consultancy Services', band: 2 },
  { name: 'Infosys', band: 2 },
  { name: 'Deloitte', band: 3 },
  { name: 'Razorpay', band: 4 },
  { name: 'Swiggy', band: 3 },
  { name: 'Reliance Industries', band: 3 },
  { name: 'Apollo Hospitals', band: 3 },
  { name: 'Self-employed (Family Business)', band: 3 },
  { name: 'Wipro', band: 2 },
  { name: 'Zomato', band: 3 },
];

export const DESIGNATIONS_BY_BAND: Record<number, string[]> = {
  1: ['Junior Analyst', 'Associate Trainee'],
  2: ['Software Engineer', 'Business Analyst', 'Consultant', 'Designer'],
  3: ['Senior Engineer', 'Product Manager', 'Senior Consultant', 'Architect', 'Doctor'],
  4: ['Engineering Lead', 'Senior Product Manager', 'Principal Consultant', 'Director'],
  5: ['VP of Engineering', 'Partner', 'Founder', 'Chief Product Officer'],
};

export const LIFESTYLE_TAGS = [
  'Fitness', 'Travel', 'Foodie', 'Reading', 'Yoga', 'Hiking', 'Music', 'Cooking',
  'Photography', 'Cycling', 'Meditation', 'Theatre', 'Running', 'Painting', 'Gaming',
  'Volunteering', 'Wine tasting', 'Dancing',
];

export const CORE_VALUES = [
  'Honesty', 'Ambition', 'Family-first', 'Empathy', 'Independence', 'Spirituality',
  'Loyalty', 'Adventure', 'Financial security', 'Personal growth', 'Kindness',
  'Open-mindedness', 'Tradition', 'Work-life balance',
];

export const NON_NEGOTIABLES = [
  'Non-smoker', 'Same religion', 'Vegetarian', 'Wants kids', 'Financially stable',
  'Family-oriented', 'No drinking', 'Career-driven',
];

export const RELATIONSHIP_GOALS = [
  'Marriage within 1 year',
  'Marriage within 2 years',
  'Long-term committed relationship leading to marriage',
  'Finding a life partner who shares my values',
  'Settling down with the right person, no rush',
];

export const FAMILY_EXPECTATIONS = [
  'Supportive of working partner; close-knit family',
  'Expect partner to embrace family traditions',
  'Independent nuclear setup preferred',
  'Comfortable living with extended family',
  'Wants a partner who values family time',
  'Open and modern outlook, mutual respect',
];

export const EDUCATION_PREFERENCES = [
  'Bachelors+',
  'Masters+',
  'Graduate or above',
  'No specific preference',
];

export const NOTE_TEMPLATES: { category: string; content: string }[] = [
  { category: 'FAMILY', content: 'Parents are actively involved in the search and want to meet the matchmaker.' },
  { category: 'PREFERENCE', content: 'Wants children within 3 years; this is a firm priority.' },
  { category: 'PREFERENCE', content: 'Open to relocation for the right partner, especially metro cities.' },
  { category: 'STRATEGY', content: 'Values emotional maturity over career prestige — prioritize accordingly.' },
  { category: 'GENERAL', content: 'Very career-focused; prefers an entrepreneurial or ambitious partner.' },
  { category: 'CALL_LOG', content: 'Discovery call done. Warm, articulate, clear about non-negotiables.' },
  { category: 'CONCERN', content: 'Slightly hesitant about long-distance; keep matches geographically close.' },
  { category: 'FEEDBACK', content: 'Liked the last profile but felt lifestyle compatibility was off.' },
];
