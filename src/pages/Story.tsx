// Story.tsx

const Story = ({ onExit }: { onExit: () => void }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 to-pink-900 text-white overflow-y-auto">
      
      
      <button
        onClick={onExit}
        className="absolute top-4 right-6 text-white/80 hover:text-white text-3xl z-10"
      >
        ×
      </button>

      <div className="max-w-5xl mx-auto space-y-16">
        <h1 className="text-6xl md:text-7xl font-bold text-center pt-10">The Bee Curious Story 🐝</h1>

        {/* Comic strip style */}
        <section className="space-y-12">
          <h2 className="text-4xl font-bold text-center">A short tale of learning...</h2>

          <div className="space-y-8">
            <div className="bg-white/10 rounded-3xl p-4 text-center">
              <p className="text-2xl italic mb-2">
                "The best way to learn is with models!"
              </p>

{/* First image – probably "modelteacher.webp" (the "models" pun) */}
<div className="relative w-full max-w-3xl mx-auto aspect-video rounded-2xl">
<img
    src="/images/modelteacher.webp"
    alt="Not those models – language models!"
    className="w-full max-w-3xl mx-auto rounded-2xl object-cover"
  />
</div>


              <p className="text-3xl mt-4 font-bold">No... not those models.</p>
            </div>

            <div className="bg-white/10 rounded-3xl p-2 text-center">
              <p className="text-2xl italic mb-4">Language models! 🤖</p>

{/* Second image – e.g., "aiteacher.webp" */}
<div className="relative w-full max-w-3xl mx-auto aspect-video rounded-2xl">
<img
    src="/images/aiteacher.webp"
    alt="AI teacher"
    className="w-full max-w-3xl mx-auto rounded-2xl object-cover"
  />
</div>



{/* Third image – e.g., "beestudent.webp" or similar */}
<div className="relative w-full max-w-3xl mx-auto mt-12 aspect-video rounded-2xl">
<img
    src="/images/beestudent.webp"
    alt="Bee student learning"
    className="w-full max-w-3xl mx-auto rounded-2xl object-cover"
  />
</div>

            </div>
          </div>
        </section>

        {/* Fake Reviews Section */}
        <section className="space-y-10">
          <h2 className="text-5xl font-bold text-center">User Reviews (100% Real*)</h2>
          <p className="text-center text-xl text-white/70">*No users were harmed in the making of these reviews</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-yellow-600/20 border-4 border-yellow-400 rounded-3xl p-4">
              <p className="text-2xl italic mb-6">
                "I started using Bee Curious three days ago...<br />
                Now I live on the International Space Station. Coincidence? I think not."
              </p>
              <p className="text-right font-bold text-xl">- Elon B. (probably)</p>
              <div className="text-4xl text-yellow-400 text-right">★★★★★★★ (7/5)</div>
            </div>

            <div className="bg-yellow-600/20 border-4 border-yellow-400 rounded-3xl p-4">
              <p className="text-2xl italic mb-6">
                "I hacked this review section just to give it 10 out of 5 stars.<br />
                Worth it."
              </p>
              <p className="text-right font-bold text-xl">- AnonymousHacker420</p>
              <div className="text-4xl text-yellow-400 text-right">★★★★★★★★★★ (10/5)</div>
            </div>

            <div className="bg-yellow-600/20 border-4 border-yellow-400 rounded-3xl p-4">
              <p className="text-2xl italic mb-6">
                "My dog learned quantum physics. He still chases his tail, but now he understands why."
              </p>
              <p className="text-right font-bold text-xl">- DogMom42</p>
              <div className="text-4xl text-yellow-400 text-right">★★★★★</div>
            </div>

            <div className="bg-yellow-600/20 border-4 border-yellow-400 rounded-3xl p-4">
              <p className="text-2xl italic mb-6">
                "Finally finished a learning roadmap. My mom is proud. I'm proud. The bee is proud."
              </p>
              <p className="text-right font-bold text-xl">- ActualUser2025</p>
              <div className="text-4xl text-yellow-400 text-right">★★★★★</div>
            </div>
          </div>
        </section>

        {/* Bee mascot */}
<div className="text-center">
  {/* Speech bubble with tail pointing to the bee */}
  <div className="relative max-w-2xl mx-auto z-10">
    {/* Main bubble */}
    <div className="bg-white text-purple-900 text-2xl md:text-3xl font-bold italic py-8 px-12 rounded-3xl shadow-2xl inline-block">
      Your friendly learning bee says: Keep buzzing forward! 🐝
    </div>

    {/* Tail pointing down */}
    <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 w-0 h-0 
                    border-l-[20px] border-l-transparent
                    border-r-[20px] border-r-transparent
                    border-t-[32px] border-t-white" />
  </div>

  {/* Container for bee image + overlapping button */}
  <div className="relative inline-block">
    {/* Bee image */}
    <img
      src="/images/beebuzzing.webp"
      alt="Friendly learning bee mascot"
      className="w-full max-w-3xl mx-auto rounded-2xl object-cover p-2 shadow-2xl"
    />

    {/* Button that overlaps the bottom of the image */}
<div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none p-4">
  <button
    onClick={onExit}
    className="pointer-events-auto
               px-12 py-7 
               text-2xl md:text-3xl lg:text-4xl 
               font-bold text-white 
               rounded-3xl
               
               /* Gradient */
               bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-400
               hover:from-blue-700 hover:via-cyan-600 hover:to-blue-500
               
               /* Floating effect + enhanced drop shadow */
               shadow-2xl hover:shadow-3xl
               -translate-y-10           /* lifts it up from the bottom */
               hover:-translate-y-12     /* extra lift on hover */

              /* Floating animation */
               animate-float
               
               /* Smooth animations */
               transition-all duration-300 ease-out
               hover:scale-105
               
               /* Optional: subtle inner glow */
               ring-4 ring-white/20"
  >
    Click here to keep Buzzing (Go learn!) 🐝
  </button>
</div>
  </div>
</div>

      </div>
    </div>
  );
};

export default Story;