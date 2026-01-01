import express from 'express';
import { Property, Agent, Lead, BlogPost, User } from '../models/index.js';
import { Newsletter } from '../models/newsLetter.js';


const router = express.Router();

// --- PROPERTIES ---
router.get('/properties', async (req, res) => {
  try {
    const { minPrice, maxPrice, search, status, agentId, sortBy } = req.query;
    let query = {};

    if (agentId) query.agentId = agentId;
    if (status) query.status = status;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { 'location.city': regex },
        { type: regex }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOptions = { price: 1 };
    if (sortBy === 'price_desc') sortOptions = { price: -1 };

    const properties = await Property.find(query).sort(sortOptions);
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/properties/:slug', async (req, res) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/properties', async (req, res) => {
  console.log("You are here");
  try {
    // console.log('Creating property with data:', req.body);
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    console.error('Error creating property:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/properties/id/:id', async (req, res) => {
  console.log('UPDATE PAYLOAD:', req.body);

  const { _id, ...updateData } = req.body;

  const updated = await Property.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updated) {
    console.log('❌ NO DOCUMENT FOUND FOR ID:', req.params.id);
    return res.status(404).json({ message: 'Property not found' });
  }

  console.log('✅ UPDATED:', updated._id);
  res.json(updated);
});

router.delete('/properties/:id', async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AGENTS ---
router.get('/agents', async (req, res) => {
  try {
    const { includeInactive } = req.query;
    let query = {};
    if (includeInactive !== 'true') {
        query.status = { $in: ['ACTIVE', 'ON_LEAVE'] };
    }
    const agents = await Agent.find(query);
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find agent
    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // 2. Find related properties
    const properties = await Property.find({ agentId: id });

    // 3. Find related leads
    const leads = await Lead.find({
      $or: [
        { assignedAgentId: id },
        { propertyId: { $in: properties.map(p => p._id.toString()) } }
      ]
    });

    // 4. Prepare response
    res.json({
      agent: {
        ...agent.toObject(),
        id: agent._id
      },
      properties,
      leads,
      stats: {
        totalProperties: properties.length,
        activeLeads: leads.filter(l => l.status === 'NEW').length
      }
    });

  } catch (err) {
    console.error('Get agent details error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/agents', async (req, res) => {
  try {
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (err) {
    console.error('Error creating agent:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/agents/:id', async (req, res) => {
  console.log('Updating agent with id:', req.params.id, 'Data:', req.body);
    try {
        const agent = await Agent.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
        res.json(agent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/agents/:id', async (req, res) => {

  console.log('Attempting to delete agent with id:', req);
    try {
        const agentId = req.params.id;
        const propertyCount = await Property.countDocuments({ agentId: agentId });
        
        if (propertyCount > 0) {
            return res.status(400).json({ 
                error: `Cannot delete agent. They have ${propertyCount} active listings. Reassign listings first.` 
            });
        }

        await Agent.findOneAndDelete({ id: agentId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/agents/reassign', async (req, res) => {
    try {
        const { oldAgentId, newAgentId } = req.body;
        await Property.updateMany({ agentId: oldAgentId }, { agentId: newAgentId });
        await Agent.findOneAndUpdate({ id: oldAgentId }, { listingsCount: 0 });
        const count = await Property.countDocuments({ agentId: newAgentId });
        await Agent.findOneAndUpdate({ id: newAgentId }, { listingsCount: count });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- LEADS ---
router.get('/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    // Map _id to id for frontend compatibility
    const mappedLeads = leads.map(lead => ({
      ...lead.toObject(),
      id: lead._id.toString()
    }));
    res.json(mappedLeads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/leads', async (req, res) => {
  try {
    console.log('Creating lead with data:', req.body);
    const lead = new Lead(req.body);
    await lead.save();
    // Map _id to id for frontend compatibility
    const leadObj = lead.toObject();
    res.status(201).json({
      ...leadObj,
      id: lead._id.toString()
    });
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/leads/:id', async (req, res) => {
    try {
        const updates = {};
        if (req.body.status) updates.status = req.body.status;
        if (req.body.assignedAgentId) updates.assignedAgentId = req.body.assignedAgentId;
        const lead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        // Map _id to id for frontend compatibility
        res.json({
          ...lead.toObject(),
          id: lead._id.toString()
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- NEWSLETTER ---

router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existing = await Newsletter.findOne({ email });

    if (existing) {
      return res.status(200).json({ message: 'Already subscribed' });
    }

    const subscriber = await Newsletter.create({ email });

    res.status(201).json({
      message: 'Subscribed successfully',
      id: subscriber._id.toString()
    });
  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ error: 'Subscription failed' });
  }
});


router.get('/newsletter', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });

    res.json(
      subscribers.map(s => ({
        id: s._id.toString(),
        email: s.email,
        status: s.status,
        createdAt: s.createdAt
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// --- BLOG ---
router.get('/blog', async (req, res) => {
    try {
        const { authorId } = req.query;
        let query = {};
        if (authorId) query.authorId = authorId;
        const posts = await BlogPost.find(query).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/blog/:slug', async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/blog', async (req, res) => {
    try {
        const post = new BlogPost(req.body);
        await post.save();
        res.status(201).json(post);
    } catch (err) {
      console.error('Error creating blog post:', err);
        res.status(400).json({ error: err.message });
    }
});

router.put('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Updating blog post with id:', id, 'Data:', req.body);

    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,          // return updated document
        runValidators: true // enforce schema validation
      }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(updatedPost);
  } catch (err) {
    console.error('Error updating blog post:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting blog post with id:', id);

    const deleted = await BlogPost.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    console.log('Blog post deleted');
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- USERS ---
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/users/:id/toggle-block', async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) return res.status(404).json({ error: "User not found" });
        
        if (user.name.includes('(BLOCKED)')) {
            user.name = user.name.replace(' (BLOCKED)', '');
        } else {
            user.name = user.name + ' (BLOCKED)';
        }
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/users/:id/avatar', async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ error: 'Avatar URL required' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { avatar } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      ...user.toObject(),
      id: user._id.toString()
    });
  } catch (err) {
    console.error('Update avatar error:', err);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});


// --- DASHBOARD ---
router.get('/dashboard', async (req, res) => {
    try {
        const totalProperties = await Property.countDocuments();
        const activeLeads = await Lead.countDocuments({ status: 'NEW' });
        const totalAgents = await Agent.countDocuments({ status: 'ACTIVE' });
        const totalUsers = await User.countDocuments();
        res.json({ totalProperties, activeLeads, totalAgents, totalUsers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;