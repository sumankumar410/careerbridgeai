const checkEligibility = (studentProfile, job) => {
  const reasons = [];
  let isEligible = true;

  if (!studentProfile) {
    return { isEligible: false, reasons: ['Please complete your student profile first.'] };
  }

  // 1. Check CGPA
  if (job.minCGPA && studentProfile.cgpa < job.minCGPA) {
    isEligible = false;
    reasons.push(`Your CGPA (${studentProfile.cgpa}) is below the required cutoff of ${job.minCGPA}`);
  }

  // 2. Check Branch
  if (job.eligibleBranches && job.eligibleBranches.length > 0) {
    const studentBranch = (studentProfile.branch || '').toUpperCase();
    const allowedBranches = job.eligibleBranches.map(b => b.toUpperCase());
    
    if (!allowedBranches.includes(studentBranch)) {
      isEligible = false;
      reasons.push(`Your branch (${studentBranch}) is not eligible. Allowed: ${job.eligibleBranches.join(', ')}`);
    }
  }

  // 3. Check Matched Skills
  const studentSkills = (studentProfile.skills || []).map(s => s.toLowerCase().trim());
  const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase().trim());

  const matchedSkills = job.requiredSkills.filter(skill => 
    studentSkills.includes(skill.toLowerCase().trim())
  );
  
  const missingSkills = job.requiredSkills.filter(skill => 
    !studentSkills.includes(skill.toLowerCase().trim())
  );

  return {
    isEligible,
    reasons: isEligible ? ['You meet all eligibility criteria for this job!'] : reasons,
    matchedSkills,
    missingSkills,
    matchPercentage: jobSkills.length > 0 
      ? Math.round((matchedSkills.length / jobSkills.length) * 100) 
      : 70
  };
};

module.exports = { checkEligibility };