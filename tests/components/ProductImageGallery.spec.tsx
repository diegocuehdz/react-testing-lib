import { render, screen } from "@testing-library/react";
import ProductImageGallery from "../../src/components/ProductImageGallery";

describe("ProductImageGallery", () => {
  it("should render nothing if given an empty array", () => {
    const { container } = render(<ProductImageGallery imageUrls={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render nothing if given an empty array", () => {
    const imageUrlList = ["url1", "url2"];
    render(<ProductImageGallery imageUrls={imageUrlList} />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);

    imageUrlList.forEach((url, index) => {
      expect(images[index]).toHaveAttribute("src", url);
    });
  });
});
