import { useState } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, UploadCloud, X } from 'lucide-react';
import { getMediaUrl, API_BASE_URL } from '../utils/api';

const AddProductForm = ({ user, onSuccess, onCancel, initialCategory, initialProduct }) => {
    const [title, setTitle] = useState(initialProduct ? initialProduct.title : '');
    const [price, setPrice] = useState(initialProduct ? initialProduct.price : '');
    const [description, setDescription] = useState(initialProduct ? initialProduct.description : '');
    const [categories, setCategories] = useState(initialProduct?.categories?.length ? initialProduct.categories : (initialCategory ? [initialCategory] : []));
    
    const [variantGroups, setVariantGroups] = useState(() => {
        if (initialProduct && initialProduct.variants && initialProduct.variants.length > 0) {
            const groups = [];
            const colorMap = new Map();
            initialProduct.variants.forEach(variant => {
                if (!colorMap.has(variant.color)) {
                    const newGroup = {
                        color: variant.color,
                        hexCode: variant.hexCode,
                        images: variant.imageUrl ? [variant.imageUrl, ...(variant.additionalImages || [])] : [],
                        uploading: false,
                        sizes: []
                    };
                    colorMap.set(variant.color, newGroup);
                    groups.push(newGroup);
                }
                colorMap.get(variant.color).sizes.push({
                    size: variant.size,
                    stockQuantity: variant.stockQuantity
                });
            });
            return groups;
        }
        return [{
            color: '',
            hexCode: '#000000',
            images: [],
            uploading: false,
            sizes: [{ size: 'S', stockQuantity: 10 }]
        }];
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleAddColorGroup = () => {
        setVariantGroups([...variantGroups, {
            color: '', hexCode: '#000000', images: [], uploading: false, sizes: [{ size: 'S', stockQuantity: 10 }]
        }]);
    };

    const handleRemoveColorGroup = (index) => {
        setVariantGroups(variantGroups.filter((_, i) => i !== index));
    };

    const handleAddSize = (groupIndex) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].sizes.push({ size: 'M', stockQuantity: 10 });
        setVariantGroups(newGroups);
    };

    const handleRemoveSize = (groupIndex, sizeIndex) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].sizes = newGroups[groupIndex].sizes.filter((_, i) => i !== sizeIndex);
        setVariantGroups(newGroups);
    };

    const updateColorGroup = (index, field, value) => {
        const newGroups = [...variantGroups];
        newGroups[index][field] = value;
        setVariantGroups(newGroups);
    };

    const updateSize = (groupIndex, sizeIndex, field, value) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].sizes[sizeIndex][field] = value;
        setVariantGroups(newGroups);
    };

    const handleImageUpload = async (e, groupIndex) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });

        updateColorGroup(groupIndex, 'uploading', true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.post(`${API_BASE_URL}/api/upload/multiple`, formData, config);
            const newGroups = [...variantGroups];
            newGroups[groupIndex].images = [...(newGroups[groupIndex].images || []), ...data];
            setVariantGroups(newGroups);
        } catch (err) {
            console.error("Upload failed", err);
            setError("Image upload failed. Is backend running?");
        } finally {
            updateColorGroup(groupIndex, 'uploading', false);
        }
    };

    const handleRemoveImage = (groupIndex, imageIndex) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].images = newGroups[groupIndex].images.filter((_, i) => i !== imageIndex);
        setVariantGroups(newGroups);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!title || !price || categories.length === 0) {
            setError("Please fill required fields (Title, Price, at least one Category)");
            return;
        }

        // Flatten variant groups into individual variants
        const flattenedVariants = [];
        variantGroups.forEach(group => {
            const imageUrl = group.images && group.images.length > 0 ? group.images[0] : '';
            const additionalImages = group.images && group.images.length > 1 ? group.images.slice(1) : [];

            group.sizes.forEach(sz => {
                flattenedVariants.push({
                    color: group.color,
                    hexCode: group.hexCode,
                    imageUrl,
                    additionalImages,
                    size: sz.size,
                    stockQuantity: Number(sz.stockQuantity)
                });
            });
        });

        if (flattenedVariants.length === 0) {
            setError("Please add at least one product variant.");
            return;
        }

        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                title,
                price: Number(price),
                description,
                categories,
                variants: flattenedVariants
            };
            
            if (initialProduct) {
                await axios.put(`${API_BASE_URL}/api/products/${initialProduct._id}`, payload, config);
            } else {
                await axios.post(`${API_BASE_URL}/api/products`, payload, config);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || `Failed to ${initialProduct ? 'update' : 'create'} product`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-sm border border-premium-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-premium-100 flex justify-between items-center bg-premium-50">
                <h3 className="text-xl font-serif text-premium-900">{initialProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={onCancel} className="text-premium-500 hover:text-premium-900 transition-colors">
                    <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {error && <div className="bg-red-50 text-red-600 p-4 text-sm rounded">{error}</div>}
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-premium-700 mb-1">Product Title *</label>
                        <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full border border-premium-200 p-2 rounded focus:outline-none focus:border-premium-900" placeholder="e.g. Elegant Anarkali Suit" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-premium-700 mb-1">Price (₹) *</label>
                        <input type="number" value={price} onChange={e=>setPrice(e.target.value)} className="w-full border border-premium-200 p-2 rounded focus:outline-none focus:border-premium-900" placeholder="2999" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-premium-700 mb-1">Categories (comma separated) *</label>
                        <input 
                            type="text" 
                            value={categories.join(', ')} 
                            onChange={e => setCategories(e.target.value.split(',').map(c => c.trim()).filter(c => c !== ''))} 
                            className="w-full border border-premium-200 p-2 rounded focus:outline-none focus:border-premium-900" 
                            placeholder="e.g. Kurtis, New Arrivals, Summer" 
                            required 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-premium-700 mb-1">Description</label>
                        <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border border-premium-200 p-2 rounded focus:outline-none focus:border-premium-900 h-24" placeholder="Product details and fabric info..."></textarea>
                    </div>
                </div>

                {/* Variants Sections */}
                <div className="border-t border-premium-100 pt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-serif text-premium-900">Color Variants & Inventory</h4>
                        <button type="button" onClick={handleAddColorGroup} className="text-sm flex items-center text-premium-600 hover:text-premium-900">
                            <PlusCircle size={16} className="mr-1" /> Add Color Option
                        </button>
                    </div>

                    <div className="space-y-8">
                        {variantGroups.map((group, gIdx) => (
                            <div key={gIdx} className="bg-premium-50/50 border border-premium-100 p-5 rounded-sm relative">
                                {variantGroups.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveColorGroup(gIdx)} className="absolute top-4 right-4 text-red-400 hover:text-red-700">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                                    <div className="md:col-span-4">
                                        <label className="block text-sm font-medium text-premium-700 mb-1">Color Name</label>
                                        <input type="text" value={group.color} onChange={e => updateColorGroup(gIdx, 'color', e.target.value)} className="w-full border border-premium-200 p-2 rounded focus:outline-none focus:border-premium-900" placeholder="e.g. Royal Blue" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-premium-700 mb-1">Hex Code</label>
                                        <input type="color" value={group.hexCode} onChange={e => updateColorGroup(gIdx, 'hexCode', e.target.value)} className="w-full h-10 border border-premium-200 p-1 rounded cursor-pointer" />
                                    </div>
                                    <div className="md:col-span-6">
                                        <label className="block text-sm font-medium text-premium-700 mb-1">Color Images</label>
                                        <div className="space-y-3">
                                            {group.images && group.images.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {group.images.map((img, iIdx) => (
                                                        <div key={iIdx} className="w-12 h-12 relative bg-white rounded border border-premium-200 overflow-hidden shrink-0 group">
                                                            <img src={getMediaUrl(img)} alt="" className="w-full h-full object-cover" />
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveImage(gIdx, iIdx)} 
                                                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="relative">
                                                <input type="file" multiple onChange={(e) => handleImageUpload(e, gIdx)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                                <div className="w-full border-2 border-dashed border-premium-300 rounded p-2 text-center text-premium-600 hover:bg-white hover:border-premium-500 transition-colors flex justify-center items-center h-10 text-sm">
                                                    {group.uploading ? 'Uploading...' : <><UploadCloud size={16} className="mr-2" /> Upload Images</>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sizes within Color */}
                                <div className="pl-4 border-l-2 border-premium-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-medium text-premium-700">Sizes & Quantities</label>
                                        <button type="button" onClick={() => handleAddSize(gIdx)} className="text-xs flex items-center text-premium-600 hover:text-premium-900">
                                            <PlusCircle size={14} className="mr-1" /> Add Size
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {group.sizes.map((sz, sIdx) => (
                                            <div key={sIdx} className="flex items-center space-x-4">
                                                <input type="text" value={sz.size} onChange={e => updateSize(gIdx, sIdx, 'size', e.target.value)} className="w-24 border border-premium-200 p-1.5 text-sm rounded" placeholder="Size (e.g. M)" />
                                                <input type="number" value={sz.stockQuantity} onChange={e => updateSize(gIdx, sIdx, 'stockQuantity', e.target.value)} className="w-32 border border-premium-200 p-1.5 text-sm rounded" placeholder="Stock Qty" />
                                                {group.sizes.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveSize(gIdx, sIdx)} className="text-red-400 hover:text-red-700 p-1"><X size={16} /></button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-premium-100 flex justify-end">
                    <button type="button" onClick={onCancel} className="mr-4 px-6 py-3 text-premium-700 font-medium hover:text-premium-900">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary flex items-center">
                        {submitting ? 'Saving...' : (initialProduct ? 'Update Product' : 'Save Product')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductForm;
