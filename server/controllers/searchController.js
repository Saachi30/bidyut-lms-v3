// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// // Utility function for calculating relevance
// const calculateRelevanceScore = (result, query) => {
//   const queryLower = query.toLowerCase();
//   const nameLower = (result.name || '').toLowerCase(); // Use 'name' for User and 'title' for Quiz
//   const descriptionLower = (result.description || '').toLowerCase();

//   let score = 0;

//   // Exact match
//   if (nameLower === queryLower) score += 20;

//   // Partial name/title match
//   if (nameLower.includes(queryLower)) score += 10;

//   // Partial description match
//   if (descriptionLower.includes(queryLower)) score += 5;

//   return score;
// };

// // Global search handler
// const globalSearch = async (req, res) => {
//   try {
//     const { query, limit = 10 } = req.query;

//     // Define searchable models and their searchable fields
//     const searchModels = {
//       course: {
//         model: prisma.course,
//         fields: ['name', 'description'], // Fields to search in the Course model
//       },
//       quiz: {
//         model: prisma.quiz,
//         fields: ['title', 'description'], // Fields to search in the Quiz model
//       },
//       user: {
//         model: prisma.user,
//         fields: ['name', 'email'], // Fields to search in the User model
//       },
//     };

//     // Perform parallel searches
//     const searchPromises = Object.entries(searchModels).map(async ([type, { model, fields }]) => {
//       // Build the OR conditions dynamically based on the model's searchable fields
//       const whereConditions = fields.map((field) => ({
//         [field]: { contains: query, mode: 'insensitive' },
//       }));

//       const results = await model.findMany({
//         where: {
//           OR: whereConditions,
//         },
//         take: limit,
//         select: {
//           id: true,
//           ...(fields.includes('name') && { name: true }), // Include name if it exists
//           ...(fields.includes('title') && { title: true }), // Include title if it exists
//           ...(fields.includes('description') && { description: true }), // Include description if it exists
//           ...(fields.includes('email') && { email: true }), // Include email if it exists
//         },
//       });

//       return results.map((result) => ({
//         ...result,
//         type,
//         relevanceScore: calculateRelevanceScore(result, query),
//       }));
//     });

//     // Combine and sort results
//     const searchResults = await Promise.all(searchPromises);
//     const combinedResults = searchResults
//       .flat()
//       .sort((a, b) => b.relevanceScore - a.relevanceScore)
//       .slice(0, limit);

//     res.status(200).json({
//       status: 'success',
//       results: combinedResults,
//       total: combinedResults.length,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 'error',
//       message: 'Global search failed',
//       error: error.message,
//     });
//   }
// };

// // Advanced search handler
// const advancedSearch = async (req, res) => {
//   try {
//     const { query, types = [], minRelevance = 0, limit = 20 } = req.body;

//     // Define searchable models and their searchable fields
//     const searchModels = {
//       course: {
//         model: prisma.course,
//         fields: ['name', 'description'], // Fields to search in the Course model
//       },
//       quiz: {
//         model: prisma.quiz,
//         fields: ['title', 'description'], // Fields to search in the Quiz model
//       },
//       user: {
//         model: prisma.user,
//         fields: ['name', 'email'], // Fields to search in the User model
//       },
//     };

//     // Perform searches across specified or all types
//     const searchPromises = (types.length ? types : Object.keys(searchModels)).map(async (type) => {
//       const { model, fields } = searchModels[type];

//       // Build the OR conditions dynamically based on the model's searchable fields
//       const whereConditions = fields.map((field) => ({
//         [field]: { contains: query, mode: 'insensitive' },
//       }));

//       const results = await model.findMany({
//         where: {
//           OR: whereConditions,
//         },
//         take: limit,
//         select: {
//           id: true,
//           ...(fields.includes('name') && { name: true }), // Include name if it exists
//           ...(fields.includes('title') && { title: true }), // Include title if it exists
//           ...(fields.includes('description') && { description: true }), // Include description if it exists
//           ...(fields.includes('email') && { email: true }), // Include email if it exists
//         },
//       });

//       return results
//         .map((result) => ({
//           ...result,
//           type,
//           relevanceScore: calculateRelevanceScore(result, query),
//         }))
//         .filter((result) => result.relevanceScore >= minRelevance)
//         .sort((a, b) => b.relevanceScore - a.relevanceScore);
//     });

//     const results = await Promise.all(searchPromises);

//     res.status(200).json({
//       status: 'success',
//       results: results.flat(),
//       total: results.flat().length,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 'error',
//       message: 'Advanced search failed',
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   globalSearch,
//   advancedSearch,
// };

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Utility function for calculating relevance
const calculateRelevanceScore = (result, queryTokens) => {
  const nameLower = (result.name || result.title || '').toLowerCase(); // Handle both name and title
  const descriptionLower = (result.description || '').toLowerCase();

  let score = 0;

  // Check for exact match of the entire query
  if (nameLower === queryTokens.join(' ').toLowerCase()) score += 30;
  if (descriptionLower === queryTokens.join(' ').toLowerCase()) score += 20;

  // Check for partial matches in name/title and description
  queryTokens.forEach((token, index) => {
    const tokenLower = token.toLowerCase();

    // Exact match in name/title
    if (nameLower === tokenLower) score += 20;

    // Partial match in name/title
    if (nameLower.includes(tokenLower)) {
      score += 10;
      // Bonus if the token is in the correct position (e.g., "math quiz" vs. "quiz math")
      if (nameLower.indexOf(tokenLower) === index) score += 5;
    }

    // Partial match in description
    if (descriptionLower.includes(tokenLower)) {
      score += 5;
      // Bonus if the token is in the correct position
      if (descriptionLower.indexOf(tokenLower) === index) score += 2;
    }
  });

  return score;
};

// Global search handler
const globalSearch = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    // Tokenize the query into individual words
    const queryTokens = query.split(' ').filter((token) => token.trim() !== '');

    // Define searchable models and their searchable fields
    const searchModels = {
      course: {
        model: prisma.course,
        fields: ['name', 'description'], // Fields to search in the Course model
      },
      quiz: {
        model: prisma.quiz,
        fields: ['title', 'description'], // Fields to search in the Quiz model
      },
      user: {
        model: prisma.user,
        fields: ['name', 'email'], // Fields to search in the User model
      },
    };

    // Perform parallel searches
    const searchPromises = Object.entries(searchModels).map(async ([type, { model, fields }]) => {
      // Build the OR conditions dynamically based on the model's searchable fields
      const whereConditions = fields.map((field) => ({
        OR: queryTokens.map((token) => ({
          [field]: { contains: token, mode: 'insensitive' },
        })),
      }));

      const results = await model.findMany({
        where: {
          OR: whereConditions,
        },
        take: limit,
        select: {
          id: true,
          ...(fields.includes('name') && { name: true }), // Include name if it exists
          ...(fields.includes('title') && { title: true }), // Include title if it exists
          ...(fields.includes('description') && { description: true }), // Include description if it exists
          ...(fields.includes('email') && { email: true }), // Include email if it exists
        },
      });

      return results.map((result) => ({
        ...result,
        type,
        relevanceScore: calculateRelevanceScore(result, queryTokens),
      }));
    });

    // Combine and sort results
    const searchResults = await Promise.all(searchPromises);
    const combinedResults = searchResults
      .flat()
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    res.status(200).json({
      status: 'success',
      results: combinedResults,
      total: combinedResults.length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Global search failed',
      error: error.message,
    });
  }
};

// Advanced search handler
const advancedSearch = async (req, res) => {
  try {
    const { query, types = [], minRelevance = 0, limit = 20 } = req.body;

    // Tokenize the query into individual words
    const queryTokens = query.split(' ').filter((token) => token.trim() !== '');

    // Define searchable models and their searchable fields
    const searchModels = {
      course: {
        model: prisma.course,
        fields: ['name', 'description'], // Fields to search in the Course model
      },
      quiz: {
        model: prisma.quiz,
        fields: ['title', 'description'], // Fields to search in the Quiz model
      },
      user: {
        model: prisma.user,
        fields: ['name', 'email'], // Fields to search in the User model
      },
    };

    // Perform searches across specified or all types
    const searchPromises = (types.length ? types : Object.keys(searchModels)).map(async (type) => {
      const { model, fields } = searchModels[type];

      // Build the OR conditions dynamically based on the model's searchable fields
      const whereConditions = fields.map((field) => ({
        OR: queryTokens.map((token) => ({
          [field]: { contains: token, mode: 'insensitive' },
        })),
      }));

      const results = await model.findMany({
        where: {
          OR: whereConditions,
        },
        take: limit,
        select: {
          id: true,
          ...(fields.includes('name') && { name: true }), // Include name if it exists
          ...(fields.includes('title') && { title: true }), // Include title if it exists
          ...(fields.includes('description') && { description: true }), // Include description if it exists
          ...(fields.includes('email') && { email: true }), // Include email if it exists
        },
      });

      return results
        .map((result) => ({
          ...result,
          type,
          relevanceScore: calculateRelevanceScore(result, queryTokens),
        }))
        .filter((result) => result.relevanceScore >= minRelevance)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
    });

    const results = await Promise.all(searchPromises);

    res.status(200).json({
      status: 'success',
      results: results.flat(),
      total: results.flat().length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Advanced search failed',
      error: error.message,
    });
  }
};

module.exports = {
  globalSearch,
  advancedSearch,
};