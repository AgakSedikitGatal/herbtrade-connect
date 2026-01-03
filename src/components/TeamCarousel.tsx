import { motion } from "framer-motion";

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Raihan Adz Dzikra",
    role: "Project Manager",
    image: "yan jas.jpeg",
  },
  {
    name: "Iriena Feyza Zafira Rosyidi",
    role: "Research and Development",
    image: "zaf jas.PNG",
  },
  {
    name: "Fionna Nur Illahi",
    role: "Business Manager",
    image: "fio jas.jpeg",
  },
  {
    name: "Dustin Favian Baihaqi",
    role: "Marketing Director",
    image: "dus.JPG",
  },
  {
    name: "Aulia Rahmah Fitriah",
    role: "Research and Development",
    image: "aul jas.jpeg",
  },
  {
    name: "Muhammad Fariz Abid R",
    role: "Backend Developer",
    image: "nyam jas.JPG",
  },
  {
    name: "Topan Suryadi Laga",
    role: "Frontend Developer",
    image: "topan jas.png",
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export const TeamCarousel = () => {
  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 py-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {teamMembers.map((member) => (
        <motion.div 
          key={member.name}
          variants={cardVariants}
          className="group flex flex-row sm:flex-col lg:flex-row gap-4 sm:gap-3 lg:gap-5 items-start sm:items-center lg:items-start bg-card rounded-xl p-4 sm:p-5 border border-border/30 cursor-pointer
            transition-all duration-300 ease-out
            hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30
            hover:-translate-y-1 hover:scale-[1.02]"
        >
          {/* Photo */}
          <div className="flex-shrink-0 overflow-hidden rounded-lg">
            <div className="w-24 h-28 sm:w-full sm:h-48 lg:w-28 lg:h-36 rounded-lg overflow-hidden bg-muted
              transition-transform duration-300 group-hover:scale-105">
              <img 
                src={member.image} 
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
          
          {/* Info */}
          <div className="flex flex-col justify-center sm:text-center lg:text-left pt-1 sm:pt-0">
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight mb-2 sm:mb-3
              transition-colors duration-300 group-hover:text-primary">
              {member.name}
            </h3>
            <div className="flex items-start gap-2 sm:justify-center lg:justify-start">
              <div className="w-1 h-8 sm:h-6 bg-primary rounded-full flex-shrink-0 mt-0.5
                transition-all duration-300 group-hover:h-10 group-hover:bg-primary/80" />
              <p className="text-sm text-muted-foreground leading-relaxed
                transition-colors duration-300 group-hover:text-foreground/80">
                {member.role}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
