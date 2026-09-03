export default function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-serif tracking-tight text-cw-text-1">
          About Skill<span className="text-cw-accent italic">Bridge</span>
        </h1>
        <p className="text-lg text-cw-text-2 max-w-2xl mx-auto">
          SkillBridge is an exclusive platform built for students to exchange skills, freelance their talents, and collaborate on exciting projects.
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-2xl font-bold text-cw-text-1">Our Mission</h2>
        <p className="text-cw-text-2 leading-relaxed">
          We believe that every student has something valuable to teach and something new to learn. 
          SkillBridge breaks down the barriers to collaboration by providing a verified, safe, and dynamic environment 
          for students to connect. Whether you are looking to earn by freelancing your skills or want to swap your 
          expertise in coding for a lesson in graphic design, SkillBridge is the place for you.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card border-t-4 border-t-freelance">
          <h3 className="text-lg font-bold text-cw-text-1 mb-2">Freelancing</h3>
          <p className="text-sm text-cw-text-2">
            Post your services or bid on tasks posted by others. Earn money and build your portfolio while you study.
          </p>
        </div>
        <div className="card border-t-4 border-t-exchange">
          <h3 className="text-lg font-bold text-cw-text-1 mb-2">Skill Swapping</h3>
          <p className="text-sm text-cw-text-2">
            Don't have a budget? No problem. Trade your skills with other students in a mutually beneficial exchange.
          </p>
        </div>
      </div>
    </div>
  );
}
